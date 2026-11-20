const AppError = require('./AppError');

/** Transitions autorisées par statut article (vendeur) */
const VENDOR_ITEM_TRANSITIONS = {
    en_attente: ['confirme', 'annule'],
    confirme: ['prepare', 'annule'],
    prepare: ['expedie', 'annule'],
    expedie: ['livre'],
    livre: [],
    annule: ['en_attente'],
    retourne: [],
};

function assertVendorItemTransition(currentStatus, newStatus) {
    const allowed = VENDOR_ITEM_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
        throw new AppError(
            `Transition invalide : "${currentStatus}" → "${newStatus}".`,
            400,
        );
    }
}

function canVendorCancelItem(itemStatus, orderLogisticsStatus) {
    if (!['en_attente', 'confirme', 'prepare'].includes(itemStatus)) return false;
    if (itemStatus === 'prepare') {
        return ['en_attente', 'pret'].includes(orderLogisticsStatus);
    }
    return true;
}

module.exports = {
    VENDOR_ITEM_TRANSITIONS,
    assertVendorItemTransition,
    canVendorCancelItem,
};
