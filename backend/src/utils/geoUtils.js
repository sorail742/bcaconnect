const { COMMUNE_CENTROIDS } = require('../services/shippingService');
const encryptionService = require('./encryptionService');

/** Hash déterministe simple (FNV-like) — même seed produit toujours le même décalage. */
const hashSeed = (seed) => {
    const str = String(seed || '');
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
};

/**
 * Géocode approximatif : reconnaît une commune connue dans un texte d'adresse libre
 * et retourne son centroïde décalé d'un léger offset déterministe (basé sur `seedId`,
 * typiquement l'id de l'utilisateur) pour éviter d'empiler plusieurs personnes de la
 * même commune sur un seul point. Retourne `null` si aucune commune n'est reconnue —
 * on omet le point plutôt que d'afficher une position inventée.
 */
const approximateGeocode = (addressText, seedId) => {
    const addr = (addressText || '').toLowerCase();
    const commune = Object.keys(COMMUNE_CENTROIDS).find((c) => addr.includes(c));
    if (!commune) return null;

    const base = COMMUNE_CENTROIDS[commune];
    const hash = hashSeed(seedId);
    const angle = (hash % 360) * (Math.PI / 180);
    const radius = 0.004 + ((hash % 97) / 97) * 0.01; // ~450 m à ~1,5 km de décalage

    return {
        lat: base.lat + Math.cos(angle) * radius,
        lng: base.lng + Math.sin(angle) * radius,
        commune,
    };
};

/**
 * Comme `approximateGeocode`, mais accepte une adresse potentiellement encore
 * chiffrée (AES-256-GCM, format `iv:tag:data`). Le hook de déchiffrement du modèle
 * `User` (`afterFind`) ne se déclenche que sur une requête directe `User.find*` —
 * il ne s'exécute PAS quand `User` est chargé via un `include` imbriqué depuis un
 * autre modèle (Order, Intervention, Credit, ...), ce qui est le cas pour les
 * cartes de rôle. On déchiffre donc explicitement ici avant de géocoder.
 */
const geocodeEncryptedAddress = (rawAddress, seedId) => {
    const plain = encryptionService.decrypt(rawAddress);
    return approximateGeocode(plain, seedId);
};

/** Convertit le champ JSON `User.location` ({type:'Point', coordinates:[lng,lat]}) en {lat,lng}. */
const pointFromUserLocation = (location) => {
    if (!location?.coordinates || location.coordinates.length !== 2) return null;
    const [lng, lat] = location.coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
};

module.exports = { approximateGeocode, geocodeEncryptedAddress, pointFromUserLocation };
