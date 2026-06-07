/**
 * Calcul des frais de livraison — 3 niveaux : éco / standard / prioritaire
 */

const DELIVERY_TYPES = {
    eco: {
        label: 'Économique',
        multiplier: 0.75,
        delai_min: 5,
        delai_max: 7,
        description: 'Livraison groupée — 5 à 7 jours',
    },
    standard: {
        label: 'Standard',
        multiplier: 1,
        delai_min: 3,
        delai_max: 5,
        description: 'Livraison classique — 3 à 5 jours',
    },
    prioritaire: {
        label: 'Prioritaire',
        multiplier: 1.6,
        delai_min: 1,
        delai_max: 2,
        description: 'Express — 24 à 48 h',
    },
};

const calculateBaseFee = (adresse, itemsCount = 1) => {
    const addr = (adresse || '').toLowerCase();
    const count = Math.max(1, parseInt(itemsCount, 10) || 1);

    if (addr.includes('kaloum')) {
        return 25000 + (count * 2500);
    }
    const communes = ['dixinn', 'ratoma', 'matam', 'matoto', 'kagbelen', 'dubréka', 'conakry'];
    if (communes.some((c) => addr.includes(c))) {
        return 20000 + (count * 2000);
    }
    return 50000 + (count * 5000);
};

const calculateShipping = (adresse, itemsCount = 1, typeLivraison = 'standard') => {
    const tier = DELIVERY_TYPES[typeLivraison] || DELIVERY_TYPES.standard;
    const base = calculateBaseFee(adresse, itemsCount);
    const frais_port = Math.round(base * tier.multiplier);

    return {
        type_livraison: typeLivraison in DELIVERY_TYPES ? typeLivraison : 'standard',
        label: tier.label,
        description: tier.description,
        frais_port,
        frais_base: base,
        multiplier: tier.multiplier,
        delai_estime_jours: tier.delai_max,
        delai_min: tier.delai_min,
        delai_max: tier.delai_max,
    };
};

const listDeliveryOptions = (adresse, itemsCount = 1) => (
    Object.keys(DELIVERY_TYPES).map((key) => calculateShipping(adresse, itemsCount, key))
);

module.exports = {
    DELIVERY_TYPES,
    calculateBaseFee,
    calculateShipping,
    listDeliveryOptions,
};
