const { Organization, OrganizationMember, User } = require('../../models');
const AppError = require('../../utils/AppError');

const isUuid = (v) => typeof v === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v);

async function assertIsAdminOrOwner(organizationId, userId) {
    const org = await Organization.findByPk(organizationId);
    if (!org) throw new AppError('Organisation non trouvée.', 404);
    if (org.proprietaire_id === userId) return org;

    const membership = await OrganizationMember.findOne({ where: { organization_id: organizationId, user_id: userId } });
    if (!membership || membership.role !== 'admin') {
        throw new AppError('Action réservée au propriétaire ou à un administrateur de l\'organisation.', 403);
    }
    return org;
}

const organizationService = {
    async create({ nom, plafond_approbation_auto }, user) {
        if (!nom || !nom.trim()) throw new AppError("Le nom de l'organisation est requis.", 400);

        const org = await Organization.create({
            nom: nom.trim(),
            proprietaire_id: user.id,
            plafond_approbation_auto: plafond_approbation_auto || null,
        });

        // Le propriétaire est automatiquement membre admin (peut approuver/inviter).
        await OrganizationMember.create({ organization_id: org.id, user_id: user.id, role: 'admin' });

        return org;
    },

    async getMine(userId) {
        const owned = await Organization.findAll({ where: { proprietaire_id: userId } });
        const memberships = await OrganizationMember.findAll({
            where: { user_id: userId },
            include: [{ model: Organization, as: 'organisation' }],
        });
        return {
            possedees: owned,
            membre_de: memberships.map((m) => ({ role: m.role, organisation: m.organisation })),
        };
    },

    async updateThreshold(organizationId, plafond_approbation_auto, user) {
        const org = await assertIsAdminOrOwner(organizationId, user.id);
        await org.update({ plafond_approbation_auto: plafond_approbation_auto ?? null });
        return org;
    },

    // Invitation simplifiée : l'utilisateur doit déjà avoir un compte BCA
    // (pas de flux d'invitation par token email pour cette première version).
    async inviteMember(organizationId, { email, role_membre }, user) {
        await assertIsAdminOrOwner(organizationId, user.id);

        if (!['acheteur', 'valideur', 'admin'].includes(role_membre)) {
            throw new AppError('Rôle invalide. Attendu : acheteur, valideur ou admin.', 400);
        }

        const invitedUser = await User.findOne({ where: { email } });
        if (!invitedUser) {
            throw new AppError("Aucun compte BCA Connect n'existe avec cet email. La personne doit d'abord créer un compte.", 404);
        }

        const existing = await OrganizationMember.findOne({ where: { organization_id: organizationId, user_id: invitedUser.id } });
        if (existing) throw new AppError('Cette personne est déjà membre de l\'organisation.', 409);

        return OrganizationMember.create({ organization_id: organizationId, user_id: invitedUser.id, role: role_membre });
    },

    async listMembers(organizationId, user) {
        await assertIsAdminOrOwner(organizationId, user.id);
        return OrganizationMember.findAll({
            where: { organization_id: organizationId },
            include: [{ model: User, as: 'utilisateur', attributes: ['id', 'nom_complet', 'email'] }],
        });
    },

    async removeMember(organizationId, memberId, user) {
        const org = await assertIsAdminOrOwner(organizationId, user.id);
        const member = await OrganizationMember.findByPk(memberId);
        if (!member || member.organization_id !== organizationId) throw new AppError('Membre non trouvé.', 404);
        if (member.user_id === org.proprietaire_id) throw new AppError('Le propriétaire ne peut pas être retiré de l\'organisation.', 400);

        await member.destroy();
        return { message: 'Membre retiré.' };
    },

    async getMembership(organizationId, userId) {
        if (!isUuid(organizationId)) return null;
        return OrganizationMember.findOne({ where: { organization_id: organizationId, user_id: userId } });
    },
};

module.exports = organizationService;
