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

/**
 * ─── Optimisation de tournée de livraison ────────────────────────────────────
 * Depuis un point de départ (entrepôt BCA par défaut : Kaloum, Conakry),
 * ordonne une liste d'arrêts pour minimiser la distance totale via l'heuristique
 * du plus proche voisin (nearest-neighbor), avec distances Haversine réelles.
 */

const DEPOT_CONAKRY = { lat: 9.509, lng: -13.712, label: 'Entrepôt BCA — Kaloum' };
const AVG_SPEED_KMH = 25; // vitesse moyenne urbaine Conakry

/** Centroïdes GPS des communes/zones desservies (géocodage léger sans API externe). */
const COMMUNE_CENTROIDS = {
    kaloum: { lat: 9.509, lng: -13.712 },
    dixinn: { lat: 9.545, lng: -13.678 },
    ratoma: { lat: 9.596, lng: -13.646 },
    matam: { lat: 9.535, lng: -13.660 },
    matoto: { lat: 9.585, lng: -13.610 },
    kagbelen: { lat: 9.680, lng: -13.480 },
    dubréka: { lat: 9.790, lng: -13.520 },
    dubreka: { lat: 9.790, lng: -13.520 },
    coyah: { lat: 9.710, lng: -13.385 },
    kindia: { lat: 10.056, lng: -12.865 },
    conakry: { lat: 9.537, lng: -13.677 },
};

/**
 * Géocode une adresse texte vers un centroïde de commune connue.
 * Retourne null si aucune commune reconnue (l'appelant peut alors ignorer l'arrêt).
 */
const geocodeAddress = (adresse) => {
    const addr = (adresse || '').toLowerCase();
    const key = Object.keys(COMMUNE_CENTROIDS).find((c) => addr.includes(c));
    return key ? { ...COMMUNE_CENTROIDS[key], commune: key } : null;
};

const toRad = (deg) => (deg * Math.PI) / 180;

/** Distance en km entre deux points GPS (formule de Haversine). */
const haversineKm = (a, b) => {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
};

/**
 * Optimise l'ordre de passage.
 * @param {Array<{id, lat, lng, label?}>} stops - arrêts à visiter (coords GPS)
 * @param {{lat, lng, label?}} [start] - point de départ (défaut : dépôt Kaloum)
 * @param {boolean} [returnToStart=false] - boucler vers le dépôt en fin de tournée
 * @returns {{ordered, total_distance_km, total_duration_min, legs}}
 */
const optimizeRoute = (stops = [], start = DEPOT_CONAKRY, returnToStart = false) => {
    const valid = (stops || []).filter(
        (s) => s && Number.isFinite(Number(s.lat)) && Number.isFinite(Number(s.lng)),
    ).map((s) => ({ ...s, lat: Number(s.lat), lng: Number(s.lng) }));

    if (valid.length === 0) {
        return { ordered: [], total_distance_km: 0, total_duration_min: 0, legs: [] };
    }

    const remaining = [...valid];
    const ordered = [];
    const legs = [];
    let current = { lat: Number(start.lat), lng: Number(start.lng), label: start.label || 'Départ' };
    let totalKm = 0;

    while (remaining.length > 0) {
        let bestIdx = 0;
        let bestDist = Infinity;
        for (let i = 0; i < remaining.length; i += 1) {
            const d = haversineKm(current, remaining[i]);
            if (d < bestDist) { bestDist = d; bestIdx = i; }
        }
        const next = remaining.splice(bestIdx, 1)[0];
        totalKm += bestDist;
        legs.push({
            from: current.label || current.id || 'point',
            to: next.label || next.id || 'arrêt',
            distance_km: Math.round(bestDist * 100) / 100,
        });
        ordered.push({ ...next, ordre: ordered.length + 1 });
        current = next;
    }

    if (returnToStart) {
        const back = haversineKm(current, start);
        totalKm += back;
        legs.push({
            from: current.label || current.id || 'point',
            to: start.label || 'Dépôt',
            distance_km: Math.round(back * 100) / 100,
        });
    }

    const total_distance_km = Math.round(totalKm * 100) / 100;
    return {
        ordered,
        total_distance_km,
        total_duration_min: Math.round((total_distance_km / AVG_SPEED_KMH) * 60),
        legs,
    };
};

module.exports = {
    DELIVERY_TYPES,
    DEPOT_CONAKRY,
    COMMUNE_CENTROIDS,
    calculateBaseFee,
    calculateShipping,
    listDeliveryOptions,
    haversineKm,
    geocodeAddress,
    optimizeRoute,
};
