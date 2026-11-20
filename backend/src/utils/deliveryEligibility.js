const { Op } = require('sequelize');

/** Statuts commande autorisant le ramassage par un transporteur */
const CARRIER_READY_ORDER_STATUTS = ['payé', 'paye', 'en_préparation'];

/**
 * Paiement suffisant pour exposer la commande aux livreurs (COD = paiement à la livraison).
 */
function isOrderPaidOrCodPending(order) {
    if (!order) return false;
    if (CARRIER_READY_ORDER_STATUTS.includes(order.statut)) return true;
    return order.statut === 'en_attente_paiement' && order.methode_paiement === 'cod';
}

/**
 * Commande prête à être proposée aux transporteurs (non assignée).
 */
function isCarrierPickupEligible(order) {
    if (!order) return false;
    if (order.statut_livraison !== 'pret') return false;
    if (order.transporteur_id) return false;
    return isOrderPaidOrCodPending(order);
}

/** Clause Sequelize pour GET /delivery/available */
function carrierAvailableWhere() {
    return {
        statut_livraison: 'pret',
        transporteur_id: null,
        [Op.or]: [
            { statut: { [Op.in]: CARRIER_READY_ORDER_STATUTS } },
            { statut: 'en_attente_paiement', methode_paiement: 'cod' },
        ],
    };
}

module.exports = {
    CARRIER_READY_ORDER_STATUTS,
    isOrderPaidOrCodPending,
    isCarrierPickupEligible,
    carrierAvailableWhere,
};
