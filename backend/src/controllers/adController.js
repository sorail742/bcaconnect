const { Publicite, PubliciteCiblage, PubliciteStat, PaiementPublicite, User } = require('../models');
const { Op } = require('sequelize');

const adController = {
    // Créer une nouvelle publicité (Vendeur ou Admin)
    create: async (req, res) => {
        try {
            const { titre, contenu, url_image, url_destination, format, date_debut, date_fin, budget_total, ciblage } = req.body;
            const vendeur_id = req.user.role === 'admin' ? (req.body.vendeur_id || null) : req.user.id;

            const ad = await Publicite.create({
                titre,
                contenu,
                url_image,
                url_destination,
                format,
                date_debut,
                date_fin,
                budget_total,
                budget_restant: budget_total,
                vendeur_id,
                statut: 'pending_payment'
            });

            if (ciblage) {
                await PubliciteCiblage.create({
                    publicite_id: ad.id,
                    role_cible: ciblage.role_cible || 'all',
                    localisation: ciblage.localisation,
                    preferences_cle: ciblage.preferences_cle
                });
            }

            // Initialiser les stats
            await PubliciteStat.create({ publicite_id: ad.id });

            res.status(201).json(ad);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Récupérer les publicités ciblées pour l'utilisateur actuel
    getForUser: async (req, res) => {
        try {
            const role = req.user ? req.user.role : 'client';

            // Trouver les pubs actives dont le ciblage correspond au rôle ou est 'all'
            const ads = await Publicite.findAll({
                where: {
                    statut: 'active',
                    date_debut: { [Op.lte]: new Date() },
                    date_fin: { [Op.gte]: new Date() },
                    budget_restant: { [Op.gt]: 0 }
                },
                include: [{
                    model: PubliciteCiblage,
                    as: 'ciblages',
                    where: {
                        [Op.or]: [
                            { role_cible: role },
                            { role_cible: 'all' }
                        ]
                    }
                }],
                order: [['createdAt', 'DESC']],
                limit: 5
            });

            // Incrémenter les impressions de manière asynchrone
            ads.forEach(ad => {
                PubliciteStat.increment('impressions', { where: { publicite_id: ad.id } });
            });

            res.json(ads);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Enregistrer un clic sur une publicité
    recordClick: async (req, res) => {
        try {
            const { id } = req.params;
            await PubliciteStat.increment('clics', { where: { publicite_id: id } });

            // Déduire un petit montant du budget restant (simulation CPC)
            const ad = await Publicite.findByPk(id);
            if (ad) {
                ad.budget_restant = Math.max(0, ad.budget_restant - 100); // 100 GNF par clic
                if (ad.budget_restant === 0) ad.statut = 'completed';
                await ad.save();
            }

            res.json({ message: "Clic enregistré" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Récupérer les statistiques d'une publicité (pour le propriétaire)
    getStats: async (req, res) => {
        try {
            const { id } = req.params;
            const ad = await Publicite.findByPk(id, {
                include: [{ model: PubliciteStat, as: 'stats' }]
            });

            if (!ad || (req.user.role !== 'admin' && ad.vendeur_id !== req.user.id)) {
                return res.status(403).json({ message: "Non autorisé" });
            }

            res.json(ad.stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = adController;
