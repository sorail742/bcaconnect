const technicianService = require('../service/technician.service');

const technicianController = {
    getTechnicianStats: async (req, res) => {
        try {
            const stats = await technicianService.getStats(req.user.id);
            res.status(200).json(stats);
        } catch (error) {
            console.error('Error fetching technician stats:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des statistiques.' });
        }
    },

    getAvailableMissions: async (req, res) => {
        try {
            const missions = await technicianService.getAvailableMissions(req.user.id);
            res.status(200).json(missions);
        } catch (error) {
            console.error('Error fetching available missions:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des missions disponibles.' });
        }
    },

    getMyMissions: async (req, res) => {
        try {
            const missions = await technicianService.getMyMissions(req.user.id);
            res.status(200).json(missions);
        } catch (error) {
            console.error('Error fetching my missions:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération de vos missions.' });
        }
    },

    // Carte des missions assignées : géocode approximatif (commune) dérivé de l'adresse
    // déclarée du client demandeur, pour chaque intervention active/en attente assignée
    // à ce technicien.
    getMyMissionsMap: async (req, res) => {
        try {
            const result = await technicianService.getMyMissionsMap(req.user.id);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error fetching missions map:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération de la carte des missions.' });
        }
    },

    acceptMission: async (req, res) => {
        try {
            const result = await technicianService.acceptMission(req.params.id, req.user.id);

            if (result.outcome === 'not_found') {
                return res.status(404).json({ error: 'Mission introuvable.' });
            }
            if (result.outcome === 'already_accepted') {
                return res.status(400).json({ error: 'Cette mission a déjà été acceptée par un autre technicien.' });
            }
            if (result.outcome === 'wrong_specialty') {
                return res.status(403).json({ error: "Cette mission requiert une spécialité que vous ne possédez pas." });
            }

            // Notifier le client que son intervention a été acceptée
            try {
                const io = req.app.get('socketio');
                if (io && result.intervention.demandeur_id) {
                    io.to(String(result.intervention.demandeur_id)).emit('sav_mission_accepted', {
                        interventionId: result.intervention.id,
                        technicienId: req.user.id,
                    });
                }
            } catch (e) {
                console.warn('[SAV] Socket notification error:', e.message);
            }

            res.status(200).json({ message: 'Mission acceptée avec succès.', intervention: result.intervention });
        } catch (error) {
            console.error('Error accepting mission:', error);
            res.status(500).json({ error: "Erreur lors de l'acceptation de la mission." });
        }
    },

    completeMission: async (req, res) => {
        try {
            const result = await technicianService.completeMission(req.params.id, req.user.id, req.body);

            if (result.outcome === 'not_found') {
                return res.status(404).json({ error: 'Mission introuvable.' });
            }
            if (result.outcome === 'not_assigned') {
                return res.status(403).json({ error: "Vous n'êtes pas assigné à cette mission." });
            }
            if (result.outcome === 'already_completed') {
                return res.status(400).json({ error: 'Cette mission est déjà terminée.' });
            }

            const io = req.app.get('socketio');
            if (io && result.walletBalance !== null) {
                io.to(req.user.id).emit('wallet_updated', { amount: result.fee, balance: result.walletBalance });
            }

            res.status(200).json({
                message: 'Mission terminée avec succès.',
                intervention: result.intervention,
                walletBalance: result.walletBalance,
                feeCredited: result.fee,
            });
        } catch (error) {
            console.error('Error completing mission:', error);
            res.status(500).json({ error: 'Erreur lors de la finalisation de la mission.' });
        }
    },

    getTechnicianEquipments: async (req, res) => {
        try {
            const equipments = await technicianService.getEquipments(req.user.id);
            res.status(200).json(equipments);
        } catch (error) {
            console.error('Error fetching equipments:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des équipements.' });
        }
    },
};

module.exports = technicianController;
