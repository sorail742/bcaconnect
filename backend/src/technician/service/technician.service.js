const { sequelize } = require('../../models');
const { geocodeEncryptedAddress } = require('../../utils/geoUtils');
const { technicianMatchesSpecialty } = require('../../constants/technicianSpecialties');
const walletRepository = require('../../common/wallet/repository/wallet.repository');
const transactionService = require('../../common/transactions/service/transaction.service');
const technicianRepository = require('../repository/technician.repository');

const technicianService = {
    async getStats(techId) {
        const [available, myMissions, wallet, user] = await Promise.all([
            technicianRepository.countAvailable(),
            technicianRepository.findMyMissionsRaw(techId),
            walletRepository.findByUserId(techId),
            technicianRepository.findUserSpecialites(techId),
        ]);

        const active = myMissions.filter((m) => m.status === 'en_cours').length;
        const completed = myMissions.filter((m) => m.status === 'resolu').length;
        const totalEarnings = myMissions
            .filter((m) => m.status === 'resolu')
            .reduce((sum, m) => sum + parseFloat(m.cout_estime || 0), 0);

        return {
            available,
            total: myMissions.length,
            active,
            completed,
            walletBalance: parseFloat(wallet?.solde_virtuel || 0),
            totalEarnings,
            specialites: user?.specialites || null,
            zone_intervention: user?.zone_intervention || null,
            nom_complet: user?.nom_complet,
        };
    },

    async getAvailableMissions(techId) {
        const me = await technicianRepository.findUserSpecialites(techId);
        return technicianRepository.findAvailableMissions(me?.specialites);
    },

    async getMyMissions(techId) {
        return technicianRepository.findMyMissions(techId);
    },

    // Carte des missions assignées : géocode approximatif (commune) dérivé de l'adresse
    // déclarée du client demandeur, pour chaque intervention active/en attente assignée
    // à ce technicien.
    async getMyMissionsMap(techId) {
        const missions = await technicianRepository.findMyMissionsForMap(techId);

        return missions
            .map((m) => {
                const client = m.demandeur;
                const geo = client?.adresse ? geocodeEncryptedAddress(client.adresse, client.id) : null;
                return geo
                    ? {
                        id: m.id,
                        nom_produit: m.Product?.nom_produit,
                        client: client?.nom_complet,
                        status: m.status,
                        location: { lat: geo.lat, lng: geo.lng },
                        commune: geo.commune,
                    }
                    : null;
            })
            .filter(Boolean);
    },

    async acceptMission(id, techId) {
        const intervention = await technicianRepository.findById(id);

        if (!intervention) {
            return { outcome: 'not_found' };
        }

        if (intervention.technicien_id !== null) {
            return { outcome: 'already_accepted' };
        }

        // Défense en profondeur : même si le filtre côté liste est contourné, un
        // technicien ne peut pas accepter une mission hors de sa spécialité.
        const me = await technicianRepository.findUserSpecialites(techId);
        if (!technicianMatchesSpecialty(me?.specialites, intervention.specialite_requise)) {
            return { outcome: 'wrong_specialty' };
        }

        intervention.technicien_id = techId;
        intervention.status = 'en_cours';
        await technicianRepository.save(intervention);

        return { outcome: 'accepted', intervention };
    },

    async completeMission(id, techId, { rapport_technique, cout_estime }) {
        const t = await sequelize.transaction();
        try {
            const intervention = await technicianRepository.findByIdForUpdate(id, t);

            if (!intervention) {
                await t.rollback();
                return { outcome: 'not_found' };
            }

            if (intervention.technicien_id !== techId) {
                await t.rollback();
                return { outcome: 'not_assigned' };
            }

            if (intervention.status === 'resolu') {
                await t.rollback();
                return { outcome: 'already_completed' };
            }

            const fee = parseFloat(cout_estime || 0);
            intervention.status = 'resolu';
            if (rapport_technique) intervention.rapport_technique = rapport_technique;
            if (cout_estime !== undefined) intervention.cout_estime = fee;
            await technicianRepository.save(intervention, { transaction: t });

            let walletBalance = null;
            if (fee > 0) {
                const wallet = await walletRepository.findByUserIdForUpdate(techId, t);

                if (wallet) {
                    wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) + fee;
                    await walletRepository.save(wallet, { transaction: t });

                    await transactionService.create({
                        portefeuille_id: wallet.id,
                        montant: fee,
                        type_transaction: 'prestation_technique',
                        statut: 'complete',
                        reference_externe: `TECH-${intervention.id.slice(0, 8)}`,
                        metadata: { intervention_id: intervention.id },
                    }, { transaction: t });

                    walletBalance = parseFloat(wallet.solde_virtuel);
                }
            }

            await t.commit();

            return { outcome: 'completed', intervention, walletBalance, fee };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    async getEquipments(techId) {
        const interventions = await technicianRepository.findEquipments(techId);

        return interventions.map((inv) => ({
            id: inv.id,
            product_id: inv.produit_id,
            name: inv.Product?.nom_produit || 'Produit inconnu',
            brand: inv.Product?.marque || 'Inconnue',
            client: inv.demandeur?.nom_complet || 'Client inconnu',
            installDate: inv.createdAt,
            warranty: inv.Guarantee
                ? `${inv.Guarantee.status} (fin: ${new Date(inv.Guarantee.date_fin).toLocaleDateString('fr-FR')})`
                : 'Aucune',
            status: inv.status === 'resolu' ? 'Fonctionnel' : 'En Panne',
            lastMaintenance: inv.updatedAt,
            issues: [inv.description_probleme],
            rapport: inv.rapport_technique,
            cout_estime: parseFloat(inv.cout_estime || 0),
        }));
    },
};

module.exports = technicianService;
