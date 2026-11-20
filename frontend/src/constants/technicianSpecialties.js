/** Spécialités technicien — valeurs normalisées pour éviter les doublons en base */
export const TECHNICIAN_SPECIALTIES = [
    { value: 'plomberie', label: 'Plomberie' },
    { value: 'electricite', label: 'Électricité' },
    { value: 'climatisation', label: 'Climatisation & Froid' },
    { value: 'maconnerie', label: 'Maçonnerie' },
    { value: 'menuiserie', label: 'Menuiserie' },
    { value: 'peinture', label: 'Peinture & Décoration' },
    { value: 'serrurerie', label: 'Serrurerie & Métallerie' },
    { value: 'informatique', label: 'Informatique & Réseaux' },
    { value: 'electromenager', label: 'Électroménager' },
    { value: 'genie_civil', label: 'Génie civil' },
    { value: 'automobile', label: 'Mécanique automobile' },
    { value: 'solaire', label: 'Énergie solaire' },
];

export const TECHNICIAN_SPECIALTY_VALUES = TECHNICIAN_SPECIALTIES.map((s) => s.value);

export function getSpecialtyLabel(value) {
    return TECHNICIAN_SPECIALTIES.find((s) => s.value === value)?.label || value;
}
