export const BCA_MOCK_ITEMS = [
    { name: 'Chemises pour hommes', icon: '👔', badge: 'blue' },
    { name: "Des boucles d'oreilles", icon: '✨', badge: null },
    { name: 'Ensembles de bijoux', icon: '💍', badge: null },
    { name: 'Bras', icon: '👚', badge: 'blue' },
    { name: 'Abaya', icon: '👗', badge: null },
    { name: 'Jeans pour hommes', icon: '👖', badge: 'blue' },
    { name: 'Bracelet', icon: '📿', badge: null },
    { name: 'Sweats à capuche', icon: '🧥', badge: 'orange' },
    { name: 'T-shirts pour hommes', icon: '👕', badge: 'orange' },
    { name: 'Caméra', icon: '📷', badge: null },
    { name: 'Drones', icon: '🚁', badge: 'orange' },
    { name: 'Robes de mariée', icon: '👰', badge: 'orange' },
    { name: 'T-shirt', icon: '👕', badge: 'orange' },
    { name: 'Trottinettes électriques', icon: '🛴', badge: 'orange' },
];

export const getSubSectionsForCategory = (categoryName) => {
    if (!categoryName || categoryName === 'Catégories pour vous') return BCA_MOCK_ITEMS;

    const mapping = {
        Mode: BCA_MOCK_ITEMS.filter((i) => ['👔', '👗', '👖', '👕', '🧥', '👰'].includes(i.icon)),
        Électronique: BCA_MOCK_ITEMS.filter((i) => ['📷', '🚁', '🛴'].includes(i.icon)),
        Bijoux: BCA_MOCK_ITEMS.filter((i) => ['💍', '✨', '📿'].includes(i.icon)),
        Vêtements: BCA_MOCK_ITEMS.filter((i) => ['👔', '👗', '👖', '👕', '🧥'].includes(i.icon)),
    };

    const match = Object.entries(mapping).find(([k]) =>
        categoryName.toLowerCase().includes(k.toLowerCase())
    );
    return match ? match[1] : BCA_MOCK_ITEMS.slice(0, 10);
};
