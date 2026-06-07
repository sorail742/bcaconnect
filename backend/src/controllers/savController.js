const { Guarantee, Intervention, Product, Order, User, Notification } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getMyGuarantees = catchAsync(async (req, res) => {
    const guarantees = await Guarantee.findAll({
        where: { acheteur_id: req.user.id },
        include: [
            { model: Product, as: 'produit', attributes: ['id', 'nom_produit', 'image_url', 'marque'] },
            { model: Order, attributes: ['id'] },
        ],
        order: [['created_at', 'DESC']],
    });
    res.json(guarantees);
});

exports.requestIntervention = catchAsync(async (req, res) => {
    const { guarantee_id, produit_id, description_probleme } = req.body;

    if (!produit_id || !description_probleme?.trim()) {
        throw new AppError('Produit et description requis.', 400);
    }

    if (guarantee_id) {
        const guarantee = await Guarantee.findOne({
            where: { id: guarantee_id, acheteur_id: req.user.id, status: 'active' },
        });
        if (!guarantee) throw new AppError('Garantie invalide ou expirée.', 400);
    }

    const intervention = await Intervention.create({
        guarantee_id: guarantee_id || null,
        produit_id,
        demandeur_id: req.user.id,
        description_probleme: description_probleme.trim(),
        status: 'en_attente',
    });

    const io = req.app.get('socketio');
    const technicians = await User.findAll({
        where: { role: 'technicien', statut: 'actif' },
        attributes: ['id'],
    });

    for (const tech of technicians) {
        const notif = await Notification.create({
            utilisateur_id: tech.id,
            titre: 'Nouvelle mission SAV',
            message: `Intervention demandée — <span class="font-black text-primary">${description_probleme.trim().slice(0, 60)}...</span>`,
            type: 'sav',
            metadata: { intervention_id: intervention.id },
        });
        if (io) {
            io.to(tech.id).emit('notification_received', notif);
            io.to(tech.id).emit('sav_mission_available', { interventionId: intervention.id });
        }
    }

    res.status(201).json({ message: 'Demande d\'intervention créée avec succès', intervention });
});

exports.getMyInterventions = catchAsync(async (req, res) => {
    const interventions = await Intervention.findAll({
        where: { demandeur_id: req.user.id },
        include: [
            { model: Product, attributes: ['id', 'nom_produit', 'image_url', 'marque'] },
            { model: Guarantee, attributes: ['id', 'status', 'date_fin'] },
            { model: User, as: 'technicien', attributes: ['id', 'nom_complet', 'telephone'] },
        ],
        order: [['created_at', 'DESC']],
    });
    res.json(interventions);
});
