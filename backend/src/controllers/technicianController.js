const { Intervention, Product, Guarantee, User, Wallet, Transaction } = require('../models');
const sequelize = require('../config/database');

exports.getTechnicianStats = async (req, res) => {
    try {
        const techId = req.user.id;

        const [available, myMissions, wallet, user] = await Promise.all([
            Intervention.count({ where: { status: 'en_attente', technicien_id: null } }),
            Intervention.findAll({ where: { technicien_id: techId }, attributes: ['status', 'cout_estime'] }),
            Wallet.findOne({ where: { user_id: techId } }),
            User.findByPk(techId, { attributes: ['specialites', 'zone_intervention', 'nom_complet'] }),
        ]);

        const active = myMissions.filter((m) => m.status === 'en_cours').length;
        const completed = myMissions.filter((m) => m.status === 'resolu').length;
        const totalEarnings = myMissions
            .filter((m) => m.status === 'resolu')
            .reduce((sum, m) => sum + parseFloat(m.cout_estime || 0), 0);

        res.status(200).json({
            available,
            total: myMissions.length,
            active,
            completed,
            walletBalance: parseFloat(wallet?.solde_virtuel || 0),
            totalEarnings,
            specialites: user?.specialites || null,
            zone_intervention: user?.zone_intervention || null,
            nom_complet: user?.nom_complet,
        });
    } catch (error) {
        console.error('Error fetching technician stats:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques.' });
    }
};

exports.getAvailableMissions = async (req, res) => {
    try {
        const missions = await Intervention.findAll({
            where: {
                status: 'en_attente',
                technicien_id: null,
            },
            include: [
                { model: Product, attributes: ['id', 'nom_produit', 'marque', 'image_url'] },
                { model: User, as: 'demandeur', attributes: ['id', 'nom_complet', 'telephone', 'adresse'] },
            ],
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(missions);
    } catch (error) {
        console.error('Error fetching available missions:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des missions disponibles.' });
    }
};

exports.getMyMissions = async (req, res) => {
    try {
        const missions = await Intervention.findAll({
            where: {
                technicien_id: req.user.id,
            },
            include: [
                { model: Product, attributes: ['id', 'nom_produit', 'marque', 'image_url'] },
                { model: User, as: 'demandeur', attributes: ['id', 'nom_complet', 'telephone', 'adresse'] },
            ],
            order: [['updatedAt', 'DESC']],
        });
        res.status(200).json(missions);
    } catch (error) {
        console.error('Error fetching my missions:', error);
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
        console.error('Error accepting mission:', error);
        res.status(500).json({ error: "Erreur lors de l'acceptation de la mission." });
    }
};

exports.completeMission = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { rapport_technique, cout_estime } = req.body;
        const intervention = await Intervention.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });

        if (!intervention) {
            await t.rollback();
            return res.status(404).json({ error: 'Mission introuvable.' });
        }

        if (intervention.technicien_id !== req.user.id) {
            await t.rollback();
            return res.status(403).json({ error: "Vous n'êtes pas assigné à cette mission." });
        }

        if (intervention.status === 'resolu') {
            await t.rollback();
            return res.status(400).json({ error: 'Cette mission est déjà terminée.' });
        }

        const fee = parseFloat(cout_estime || 0);
        intervention.status = 'resolu';
        if (rapport_technique) intervention.rapport_technique = rapport_technique;
        if (cout_estime !== undefined) intervention.cout_estime = fee;
        await intervention.save({ transaction: t });

        let walletBalance = null;
        if (fee > 0) {
            const wallet = await Wallet.findOne({
                where: { user_id: req.user.id },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            if (wallet) {
                wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) + fee;
                await wallet.save({ transaction: t });

                await Transaction.create({
                    portefeuille_id: wallet.id,
                    montant: fee,
                    type_transaction: 'prestation_technique',
                    statut: 'complete',
                    reference_externe: `TECH-${intervention.id.slice(0, 8)}`,
                    metadata: { intervention_id: intervention.id },
                }, { transaction: t });

                walletBalance = parseFloat(wallet.solde_virtuel);
            }
        }

        await t.commit();

        const io = req.app.get('socketio');
        if (io && walletBalance !== null) {
            io.to(req.user.id).emit('wallet_updated', { amount: fee, balance: walletBalance });
        }

        res.status(200).json({
            message: 'Mission terminée avec succès.',
            intervention,
            walletBalance,
            feeCredited: fee,
        });
    } catch (error) {
        await t.rollback();
        console.error('Error completing mission:', error);
        res.status(500).json({ error: 'Erreur lors de la finalisation de la mission.' });
    }
};

exports.getTechnicianEquipments = async (req, res) => {
    try {
        const interventions = await Intervention.findAll({
            where: { technicien_id: req.user.id },
            include: [
                {
                    model: Product,
                    attributes: ['id', 'nom_produit', 'marque', 'image_url', 'description'],
                },
                {
                    model: Guarantee,
                    attributes: ['id', 'status', 'date_fin'],
                },
                {
                    model: User,
                    as: 'demandeur',
                    attributes: ['nom_complet', 'telephone'],
                },
            ],
            order: [['updatedAt', 'DESC']],
        });

        const equipments = interventions.map((inv) => ({
            id: inv.id,
            product_id: inv.produit_id,
            name: inv.Product?.nom_produit || 'Produit inconnu',
            brand: inv.Product?.marque || 'Inconnue',
            client: inv.demandeur?.nom_complet || 'Client inconnu',
            installDate: inv.createdAt,
            warranty: inv.Guarantee
                ? `${inv.Guarantee.status} (fin: ${new Date(inv.Guarantee.date_fin).toLocaleDateString('fr-FR')})`
                : 'Aucune',
            status: inv.status === 'resolu' ? 'Fonctionnel' : 'En Panne',
            lastMaintenance: inv.updatedAt,
            issues: [inv.description_probleme],
            rapport: inv.rapport_technique,
            cout_estime: parseFloat(inv.cout_estime || 0),
        }));

        res.status(200).json(equipments);
    } catch (error) {
        console.error('Error fetching equipments:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des équipements.' });
    }
};
