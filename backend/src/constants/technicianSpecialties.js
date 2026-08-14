const TECHNICIAN_SPECIALTIES = [
    'plomberie',
    'electricite',
    'climatisation',
    'maconnerie',
    'menuiserie',
    'peinture',
    'serrurerie',
    'informatique',
    'electromenager',
    'genie_civil',
    'automobile',
    'solaire',
];

const SPECIALTY_LABELS = {
    plomberie: 'Plomberie',
    electricite: 'Électricité',
    climatisation: 'Climatisation & Froid',
    maconnerie: 'Maçonnerie',
    menuiserie: 'Menuiserie',
    peinture: 'Peinture & Décoration',
    serrurerie: 'Serrurerie & Métallerie',
    informatique: 'Informatique & Réseaux',
    electromenager: 'Électroménager',
    genie_civil: 'Génie civil',
    automobile: 'Mécanique automobile',
    solaire: 'Énergie solaire',
};

/** Le technicien couvre-t-il la spécialité requise par l'intervention ? `specialites`
 * est une valeur unique exacte de TECHNICIAN_SPECIALTIES (voir dtoValidator.js). */
const technicianMatchesSpecialty = (technicienSpecialites, specialiteRequise) => {
    if (!specialiteRequise) return true; // aucune exigence — ouvert à tous (legacy)
    if (!technicienSpecialites) return false;
    return technicienSpecialites.toLowerCase().trim() === specialiteRequise.toLowerCase().trim();
};

module.exports = { TECHNICIAN_SPECIALTIES, SPECIALTY_LABELS, technicianMatchesSpecialty };
