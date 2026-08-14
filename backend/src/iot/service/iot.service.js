const crypto = require('crypto');
const { OrderItem, Notification } = require('../../models');
const AppError = require('../../utils/AppError');
const iotRepository = require('../repository/iot.repository');
const blockchainConfig = require('../../config/blockchain');

const hashDeviceKey = (key) => crypto.createHash('sha256').update(key).digest('hex');

// Vendeur (a au moins un article sur la commande) ou admin — seuls eux
// connaissent la nature physique du colis et peuvent activer un capteur.
async function assertCanManage(order, user) {
    if (user.role === 'admin') return;
    const vendorItems = await OrderItem.count({ where: { commande_id: order.id, fournisseur_id: user.id } });
    if (vendorItems > 0) return;
    throw new AppError('Non autorisé à gérer le suivi IoT de cette commande.', 403);
}

// Client, transporteur assigné, vendeur ou admin — tous les acteurs
// légitimes de l'expédition peuvent consulter les relevés capteur.
async function assertCanView(order, user) {
    if (user.role === 'admin') return;
    if (order.utilisateur_id === user.id) return;
    if (order.transporteur_id === user.id) return;
    const vendorItems = await OrderItem.count({ where: { commande_id: order.id, fournisseur_id: user.id } });
    if (vendorItems > 0) return;
    throw new AppError('Non autorisé à consulter le suivi IoT de cette commande.', 403);
}

const iotService = {
    /**
     * Provisionne un capteur physique pour une commande : génère une clé
     * d'appareil en clair (retournée UNE seule fois, comme une clé d'API) et
     * n'en conserve que le hash — c'est ce qui distingue ce connecteur d'une
     * simple simulation où n'importe qui pouvait POST des données pour
     * n'importe quelle commande sans aucune authentification.
     */
    async activateDevice(orderId, { temp_min, temp_max } = {}, user) {
        const order = await iotRepository.findOrderById(orderId);
        if (!order) throw new AppError('Commande non trouvée.', 404);
        await assertCanManage(order, user);

        const deviceKey = crypto.randomBytes(24).toString('hex');
        await iotRepository.updateOrder(order, {
            suivi_iot_actif: true,
            iot_device_key_hash: hashDeviceKey(deviceKey),
            iot_temp_min: temp_min ?? null,
            iot_temp_max: temp_max ?? null,
        });

        return {
            message: 'Suivi IoT activé. Conservez cette clé : elle ne sera plus jamais affichée.',
            device_key: deviceKey,
            commande_id: order.id,
        };
    },

    async deactivateDevice(orderId, user) {
        const order = await iotRepository.findOrderById(orderId);
        if (!order) throw new AppError('Commande non trouvée.', 404);
        await assertCanManage(order, user);

        await iotRepository.updateOrder(order, {
            suivi_iot_actif: false,
            iot_device_key_hash: null,
        });
        return { message: 'Suivi IoT désactivé.' };
    },

    /**
     * Réception d'une lecture capteur — authentifiée par la clé d'appareil
     * propre à la commande (X-Device-Key), plus l'authentification réelle
     * que la simulation précédente (ouverte à tous). Déclenche une alerte
     * "edge-triggered" (une seule notification par franchissement de seuil,
     * pas une par lecture) si la commande a des bornes de température.
     */
    async logSensorData({ commande_id, device_key, latitude, longitude, temperature, humidite }, io = null) {
        if (!commande_id || !device_key) {
            throw new AppError('commande_id et device_key sont requis.', 401);
        }

        const order = await iotRepository.findOrderById(commande_id);
        if (!order || !order.suivi_iot_actif || !order.iot_device_key_hash) {
            throw new AppError('Suivi IoT non activé pour cette commande.', 401);
        }
        if (hashDeviceKey(device_key) !== order.iot_device_key_hash) {
            throw new AppError('Clé d\'appareil invalide.', 401);
        }

        const temp = temperature !== undefined && temperature !== null ? parseFloat(temperature) : null;
        const horsSeuil = temp !== null && (
            (order.iot_temp_min !== null && temp < parseFloat(order.iot_temp_min)) ||
            (order.iot_temp_max !== null && temp > parseFloat(order.iot_temp_max))
        );

        // Capturé AVANT l'insertion du nouveau relevé — sinon une requête
        // "dernier relevé" après coup risque de se retrouver elle-même
        // (tri par timestamp, résolution à la milliseconde).
        const previousLog = await iotRepository.findLastLogByOrder(commande_id);

        const log = await iotRepository.createTrackingLog({
            commande_id,
            latitude,
            longitude,
            temperature_celsius: temperature,
            humidite_pourcentage: humidite,
            timestamp_appareil: new Date(),
            hors_seuil: horsSeuil,
        });

        // Edge-triggered : n'alerter que sur la transition normal -> hors
        // seuil, pas à chaque lecture tant que le colis reste hors plage.
        if (horsSeuil && previousLog?.hors_seuil !== true) {
            await notifyThresholdBreach(order, temp, io);
        }

        return log;
    },

    async getTracking(orderId, user) {
        const order = await iotRepository.findOrderById(orderId);
        if (!order) throw new AppError('Commande non trouvée.', 404);
        await assertCanView(order, user);

        const logs = await iotRepository.findLogsByOrder(orderId);
        return {
            suivi_iot_actif: order.suivi_iot_actif,
            iot_temp_min: order.iot_temp_min,
            iot_temp_max: order.iot_temp_max,
            logs,
        };
    },

    /**
     * Ancre la preuve d'un événement de commande (mise sous séquestre,
     * certificat d'authenticité, transfert de propriété) sur le réseau
     * Polygon Amoy (testnet) au moyen d'une transaction réelle, signée et
     * diffusée sur le réseau — vérifiable indépendamment de BCA sur
     * https://amoy.polygonscan.com.
     *
     * Pas de contrat Solidity dédié : le hash SHA-256 du contenu à prouver
     * est porté dans le champ `data` d'une transaction à valeur nulle vers
     * son propre émetteur (ancrage par preuve d'existence, même principe
     * que des services comme OpenTimestamps). Ça reste un appel réel au
     * réseau blockchain — répondant au cahier des charges 3.16 — sans le
     * coût et le risque opérationnel d'un déploiement/maintien de contrat
     * séparé.
     */
    async createSmartContract({ commande_id, type_contrat }, user) {
        const order = await iotRepository.findOrderById(commande_id);
        if (!order) throw new AppError('Commande non trouvée.', 404);
        await assertCanManage(order, user);

        if (!blockchainConfig.isConfigured()) {
            throw new AppError(
                "Module blockchain non configuré : aucun portefeuille Polygon Amoy défini (BLOCKCHAIN_PRIVATE_KEY).",
                503,
            );
        }

        const payload = JSON.stringify({ commande_id, type_contrat, horodatage: new Date().toISOString() });
        const dataHash = '0x' + crypto.createHash('sha256').update(payload).digest('hex');

        const wallet = blockchainConfig.getWallet();
        let tx;
        try {
            tx = await wallet.sendTransaction({ to: wallet.address, value: 0n, data: dataHash });
        } catch (err) {
            throw new AppError(`Échec de l'envoi de la transaction sur Polygon Amoy : ${err.shortMessage || err.message}`, 502);
        }

        const stub = await iotRepository.createBlockchainStub({
            commande_id,
            type_contrat,
            hash_transaction: tx.hash,
            reseau: 'polygon_amoy',
            statut_onchain: 'pending',
        });

        // Ne bloque pas la réponse HTTP sur la confirmation (peut prendre
        // plusieurs secondes sur Amoy) — mise à jour asynchrone du statut
        // dès que la transaction est minée (ou marquée en échec sinon).
        tx.wait(1)
            .then(() => iotRepository.updateBlockchainStubStatus(stub.id, 'confirmed'))
            .catch(() => iotRepository.updateBlockchainStubStatus(stub.id, 'failed'));

        return { ...stub.toJSON(), explorer_url: blockchainConfig.explorerTxUrl(tx.hash) };
    },

    async listSmartContracts(orderId, user) {
        const order = await iotRepository.findOrderById(orderId);
        if (!order) throw new AppError('Commande non trouvée.', 404);
        await assertCanView(order, user);

        const stubs = await iotRepository.findSmartContractsByOrder(orderId);
        return stubs.map((s) => ({ ...s.toJSON(), explorer_url: blockchainConfig.explorerTxUrl(s.hash_transaction) }));
    },
};

async function notifyThresholdBreach(order, temp, io) {
    const destinataires = new Set([order.utilisateur_id, order.transporteur_id].filter(Boolean));
    const vendorItems = await OrderItem.findAll({ where: { commande_id: order.id }, attributes: ['fournisseur_id'] });
    vendorItems.forEach((i) => i.fournisseur_id && destinataires.add(i.fournisseur_id));

    const titre = 'Alerte capteur : température hors seuil';
    const message = `Commande #${order.id.slice(0, 8).toUpperCase()} — température relevée <span class="font-black text-rose-600">${temp}°C</span>, hors de la plage autorisée [${order.iot_temp_min ?? '—'}°C, ${order.iot_temp_max ?? '—'}°C].`;

    for (const userId of destinataires) {
        const notif = await Notification.create({
            utilisateur_id: userId,
            titre,
            message,
            type: 'delivery',
            metadata: { commande_id: order.id, temperature: temp },
        });
        if (io) io.to(userId).emit('notification_received', notif);
    }
}

module.exports = iotService;
