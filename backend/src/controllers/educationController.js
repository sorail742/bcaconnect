const { EducationalResource } = require('../models');

exports.getAllResources = async (req, res) => {
    try {
        const role = req.user?.role || 'tous';
        // On récupère les ressources destinées à 'tous' + celles destinées au rôle de l'utilisateur
        const resources = await EducationalResource.findAll({
            where: {
                audience_cible: ['tous', role + 's'] // Simplification: 'fournisseur' -> 'fournisseurs'
            },
            order: [['createdAt', 'DESC']]
        });
        
        // S'il n'y a pas de ressources, on envoie des mock data pour la démo
        if (resources.length === 0) {
            return res.status(200).json([
                { id: '1', titre: 'Comment optimiser ses fiches produits', type_contenu: 'video', description: 'Apprenez à mettre en valeur vos produits.', url_contenu: '#', tag: 'Vente' },
                { id: '2', titre: 'Guide du paiement sécurisé Escrow', type_contenu: 'guide', description: 'Tout comprendre sur le séquestre.', url_contenu: '#', tag: 'Sécurité' },
                { id: '3', titre: 'Stratégies de tarification', type_contenu: 'article', description: 'Comment fixer le bon prix en Guinée.', url_contenu: '#', tag: 'Business' }
            ]);
        }

        res.status(200).json(resources);
    } catch (error) {
        console.error("Error fetching resources:", error);
        res.status(500).json({ error: 'Erreur lors de la récupération des ressources éducatives' });
    }
};
