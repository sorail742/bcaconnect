const AppError = require('../../utils/AppError');
const { TECHNICIAN_SPECIALTIES } = require('../../constants/technicianSpecialties');
const savRepository = require('../repository/sav.repository');

const savService = {
    async getMyGuarantees(userId) {
        return savRepository.findGuaranteesByBuyer(userId);
    },

    async requestIntervention({ guarantee_id, produit_id, description_probleme, specialite_requise }, user, files, io) {
        if (!produit_id || !description_probleme?.trim()) {
            throw new AppError('Produit et description requis.', 400);
        }
        if (specialite_requise && !TECHNICIAN_SPECIALTIES.includes(specialite_requise)) {
            throw new AppError('Spécialité invalide.', 400);
        }

        if (guarantee_id) {
            const guarantee = await savRepository.findActiveGuaranteeForBuyer(guarantee_id, user.id);
            if (!guarantee) throw new AppError('Garantie invalide ou expirée.', 400);
        }

        const intervention = await savRepository.createIntervention({
            guarantee_id: guarantee_id || null,
            produit_id,
            demandeur_id: user.id,
            description_probleme: description_probleme.trim(),
            specialite_requise: specialite_requise || null,
            status: 'en_attente',
            photos_urls: files?.length > 0
                ? files.map(f => `/uploads/sav/${f.filename}`)
                : [],
        });

        // Ne notifier que les techniciens couvrant la spécialité requise (ex: un
        // informaticien n'est pas alerté pour une intervention de plomberie) — les
        // interventions sans spécialité précisée restent notifiées à tous (legacy).
        const technicians = await savRepository.findActiveTechnicians(specialite_requise);

        for (const tech of technicians) {
            const notif = await savRepository.createNotification({
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

        return intervention;
    },

    async getMyInterventions(userId) {
        return savRepository.findInterventionsByRequester(userId);
    },

    // ─── Admin : Liste toutes les interventions ─────────────────────────────────
    async getAllInterventions() {
        return savRepository.findAllInterventions();
    },

    // ─── Admin : Modifier le statut d'une intervention ───────────────────────────
    async updateInterventionStatus(id, { status, technicien_id, rapport_technique, cout_estime }, io) {
        const intervention = await savRepository.findInterventionById(id);
        if (!intervention) throw new AppError('Intervention introuvable.', 404);

        const updates = {};
        if (status) updates.status = status;
        if (technicien_id !== undefined) updates.technicien_id = technicien_id || null;
        if (rapport_technique !== undefined) updates.rapport_technique = rapport_technique;
        if (cout_estime !== undefined) updates.cout_estime = cout_estime;

        await savRepository.updateIntervention(intervention, updates);

        // Notifier le client du changement de statut
        try {
            if (io && intervention.demandeur_id) {
                io.to(String(intervention.demandeur_id)).emit('sav_status_updated', {
                    interventionId: intervention.id,
                    status: intervention.status,
                });
            }
        } catch (e) {
            console.warn('[SAV Admin] Socket notification error:', e.message);
        }

        return intervention;
    },
};

module.exports = savService;
