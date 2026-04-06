const { Publicite, PubliciteCiblage, PubliciteStat, PaiementPublicite, User } = require('../models');
const { Op, literal } = require('sequelize');

const adController = {
    create: async (req, res, next) => {
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
            next(error);
        }
    },

    getForUser: async (req, res, next) => {
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
            next(error);
        }
    },

    recordClick: async (req, res, next) => {
        try {
            const { id } = req.params;

            await PubliciteStat.increment('clics', { where: { publicite_id: id } });

            await Publicite.update(
                { budget_restant: literal('CASE WHEN budget_restant >= 100 THEN budget_restant - 100 ELSE 0 END') },
                { where: { id } }
            );

            const ad = await Publicite.findByPk(id, { attributes: ['budget_restant'] });
            if (ad && parseFloat(ad.budget_restant) === 0) {
                await Publicite.update({ statut: 'completed' }, { where: { id } });
            }

            res.json({ message: "Clic enregistré" });
        } catch (error) {
            next(error);
        }
    },

    getStats: async (req, res, next) => {
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
            next(error);
        }
    }
};

module.exports = adController;
