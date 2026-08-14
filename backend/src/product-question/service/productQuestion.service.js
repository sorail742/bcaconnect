const AppError = require('../../utils/AppError');
const productQuestionRepository = require('../repository/productQuestion.repository');

const isProductOwner = async (produitId, userId) => {
    const product = await productQuestionRepository.findProductWithStore(produitId);
    return !!product && product.boutique?.proprietaire_id === userId;
};

const productQuestionService = {
    // Liste publique des questions visibles pour un produit
    async getForProduct(productId) {
        return productQuestionRepository.findVisibleForProduct(productId);
    },

    // Poser une question (tout utilisateur connecté)
    async ask(productId, question, user, io) {
        if (!question?.trim() || question.trim().length < 5) {
            throw new AppError('La question doit contenir au moins 5 caractères.', 400);
        }

        const product = await productQuestionRepository.findProductWithStore(productId);
        if (!product) throw new AppError('Produit introuvable.', 404);

        const created = await productQuestionRepository.create({
            produit_id: productId,
            utilisateur_id: user.id,
            question: question.trim(),
        });

        try {
            const vendorId = product.boutique?.proprietaire_id;
            if (io && vendorId && vendorId !== user.id) {
                const notif = await productQuestionRepository.createNotification({
                    utilisateur_id: vendorId,
                    titre: 'Nouvelle question produit',
                    message: `Un client a posé une question sur <span class="font-black text-primary">"${product.nom_produit}"</span>.`,
                    type: 'order',
                });
                io.to(vendorId).emit('notification_received', notif);
            }
        } catch (e) {
            console.warn('[Q&A] Notification nouvelle question:', e.message);
        }

        return productQuestionRepository.findByIdWithAuthorRespondent(created.id);
    },

    // Répondre (fournisseur propriétaire du produit, ou admin)
    async answer(id, reponse, user, io) {
        if (!reponse?.trim()) throw new AppError('La réponse ne peut pas être vide.', 400);

        const question = await productQuestionRepository.findById(id);
        if (!question) throw new AppError('Question introuvable.', 404);

        const isAdmin = user.role === 'admin';
        const isOwner = isAdmin || await isProductOwner(question.produit_id, user.id);
        if (!isOwner) throw new AppError('Seul le fournisseur de ce produit peut répondre.', 403);

        question.reponse = reponse.trim();
        question.repondu_par = user.id;
        question.repondu_at = new Date();
        await productQuestionRepository.save(question);

        try {
            if (io && question.utilisateur_id !== user.id) {
                const notif = await productQuestionRepository.createNotification({
                    utilisateur_id: question.utilisateur_id,
                    titre: 'Votre question a reçu une réponse',
                    message: 'Le fournisseur a répondu à votre question produit.',
                    type: 'order',
                });
                io.to(question.utilisateur_id).emit('notification_received', notif);
            }
        } catch (e) {
            console.warn('[Q&A] Notification réponse:', e.message);
        }

        return productQuestionRepository.findByIdWithAuthorRespondent(id);
    },

    // Marquer une question comme utile (compteur simple, sans anti-doublon strict)
    async markHelpful(id) {
        const question = await productQuestionRepository.findById(id);
        if (!question) throw new AppError('Question introuvable.', 404);
        question.utile_count += 1;
        await productQuestionRepository.save(question);
        return { utile_count: question.utile_count };
    },

    // Supprimer (auteur de la question, fournisseur du produit, ou admin)
    async remove(id, user) {
        const question = await productQuestionRepository.findById(id);
        if (!question) throw new AppError('Question introuvable.', 404);

        const isAdmin = user.role === 'admin';
        const isAuthor = question.utilisateur_id === user.id;
        const isOwner = isAdmin || isAuthor || await isProductOwner(question.produit_id, user.id);
        if (!isOwner) throw new AppError('Non autorisé.', 403);

        await productQuestionRepository.destroy(question);
    },

    // Questions en attente de réponse pour le fournisseur connecté (tableau de bord vendeur)
    async getPendingForVendor(userId) {
        return productQuestionRepository.findPendingForVendor(userId);
    },
};

module.exports = productQuestionService;
