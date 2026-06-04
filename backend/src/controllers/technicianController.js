const { Intervention, Product, Guarantee, User, Order } = require('../models');
const sequelize = require('../config/database');

exports.getAvailableMissions = async (req, res) => {
    try {
        const missions = await Intervention.findAll({
            where: {
                status: 'en_attente',
                technicien_id: null
            },
            include: [
                { model: Product, attributes: ['id', 'nom_produit', 'marque', 'image_url'] },
                { model: User, as: 'demandeur', attributes: ['id', 'nom_complet', 'telephone', 'adresse'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(missions);
    } catch (error) {
        console.error("Error fetching available missions:", error);
        res.status(500).json({ error: 'Erreur lors de la récupération des missions disponibles.' });
    }
};

exports.getMyMissions = async (req, res) => {
    try {
        const missions = await Intervention.findAll({
            where: {
                technicien_id: req.user.id
            },
            include: [
                { model: Product, attributes: ['id', 'nom_produit', 'marque', 'image_url'] },
                { model: User, as: 'demandeur', attributes: ['id', 'nom_complet', 'telephone', 'adresse'] }
            ],
            order: [['updatedAt', 'DESC']]
        });
        res.status(200).json(missions);
    } catch (error) {
        console.error("Error fetching my missions:", error);
        res.status(500).json({ error: 'Erreur lors de la récupération de vos missions.' });
    }
};

exports.acceptMission = async (req, res) => {
    try {
        const { id } = req.params;
        const intervention = await Intervention.findByPk(id);

        if (!intervention) {
            return res.status(404).json({ error: 'Mission introuvable.' });
        }

        if (intervention.technicien_id !== null) {
            return res.status(400).json({ error: 'Cette mission a déjà été acceptée par un autre technicien.' });
        }

        intervention.technicien_id = req.user.id;
        intervention.status = 'en_cours';
        await intervention.save();

        res.status(200).json({ message: 'Mission acceptée avec succès.', intervention });
    } catch (error) {
        console.error("Error accepting mission:", error);
        res.status(500).json({ error: 'Erreur lors de l\'acceptation de la mission.' });
    }
};

exports.completeMission = async (req, res) => {
    try {
        const { id } = req.params;
        const { rapport_technique, cout_estime } = req.body;
        const intervention = await Intervention.findByPk(id);

        if (!intervention) {
            return res.status(404).json({ error: 'Mission introuvable.' });
        }

        if (intervention.technicien_id !== req.user.id) {
            return res.status(403).json({ error: 'Vous n\'êtes pas assigné à cette mission.' });
        }

        intervention.status = 'resolu';
        if (rapport_technique) intervention.rapport_technique = rapport_technique;
        if (cout_estime !== undefined) intervention.cout_estime = cout_estime;
        
        await intervention.save();

        res.status(200).json({ message: 'Mission terminée avec succès.', intervention });
    } catch (error) {
        console.error("Error completing mission:", error);
        res.status(500).json({ error: 'Erreur lors de la finalisation de la mission.' });
    }
};

exports.getTechnicianEquipments = async (req, res) => {
    try {
        // Fetch products involved in this technician's interventions
        const interventions = await Intervention.findAll({
            where: { technicien_id: req.user.id },
            include: [
                { 
                    model: Product, 
                    attributes: ['id', 'nom_produit', 'marque', 'image_url', 'description'] 
                },
                {
                    model: Guarantee,
                    attributes: ['id', 'status', 'date_fin']
                },
                {
                    model: User,
                    as: 'demandeur',
                    attributes: ['nom_complet', 'telephone']
                }
            ],
            order: [['updatedAt', 'DESC']]
        });

        // Map interventions to equipments format
        const equipments = interventions.map(inv => ({
            id: inv.id,
            product_id: inv.produit_id,
            name: inv.Product?.nom_produit || 'Produit inconnu',
            brand: inv.Product?.marque || 'Inconnue',
            client: inv.demandeur?.nom_complet || 'Client inconnu',
            installDate: inv.createdAt, // Approximated by intervention creation
            warranty: inv.Guarantee ? `${inv.Guarantee.status} (fin: ${new Date(inv.Guarantee.date_fin).toLocaleDateString()})` : 'Aucune',
            status: inv.status === 'resolu' ? 'Fonctionnel' : 'En Panne',
            lastMaintenance: inv.updatedAt,
            issues: [inv.description_probleme]
        }));

        res.status(200).json(equipments);
    } catch (error) {
        console.error("Error fetching equipments:", error);
        res.status(500).json({ error: 'Erreur lors de la récupération des équipements.' });
    }
};
