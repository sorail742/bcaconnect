const { Guarantee, Intervention, Product, Order, User } = require('../models');

exports.getMyGuarantees = async (req, res) => {
    try {
        const guarantees = await Guarantee.findAll({
            where: { acheteur_id: req.user.id },
            include: [
                { model: Product, as: 'produit', attributes: ['id', 'nom_produit', 'image_url'] },
                { model: Order, attributes: ['id', 'numero_commande'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(guarantees);
    } catch (error) {
        console.error("Error fetching guarantees:", error);
        res.status(500).json({ error: 'Erreur lors de la récupération des garanties' });
    }
};

exports.requestIntervention = async (req, res) => {
    try {
        const { guarantee_id, produit_id, description_probleme } = req.body;

        const intervention = await Intervention.create({
            guarantee_id: guarantee_id || null,
            produit_id,
            demandeur_id: req.user.id,
            description_probleme,
            status: 'en_attente'
        });

        res.status(201).json({ message: 'Demande d\'intervention créée avec succès', intervention });
    } catch (error) {
        console.error("Error creating intervention:", error);
        res.status(500).json({ error: 'Erreur lors de la création de la demande d\'intervention' });
    }
};

exports.getMyInterventions = async (req, res) => {
    try {
        const interventions = await Intervention.findAll({
            where: { demandeur_id: req.user.id },
            include: [
                { model: Product, attributes: ['id', 'nom_produit'] },
                { model: Guarantee, attributes: ['id', 'status', 'date_fin'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(interventions);
    } catch (error) {
        console.error("Error fetching interventions:", error);
        res.status(500).json({ error: 'Erreur lors de la récupération des interventions' });
    }
};
