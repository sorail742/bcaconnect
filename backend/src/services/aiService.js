const axios = require('axios');
const { Order, OrderItem, Product, Store, sequelize } = require('../models');

// ─── Config Groq HTTP Direct ──────────────────────────────────────────────────
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const groqHeaders = () => ({
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json'
});

/**
 * Utilitaire : Appel Groq via axios HTTP direct
 */
const callGroq = async (systemPrompt, userMessage, maxTokens = 400, jsonMode = true) => {
    try {
        const payload = {
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            max_tokens: maxTokens,
            temperature: 0.4,
        };
        if (jsonMode) {
            payload.response_format = { type: 'json_object' };
        }

        const response = await axios.post(GROQ_API_URL, payload, {
            headers: groqHeaders(),
            timeout: 20000
        });

        const content = response.data.choices[0]?.message?.content;
        return jsonMode ? JSON.parse(content) : content;
    } catch (error) {
        const msg = error.response?.data?.error?.message || error.message;
        console.error('[Groq AI Error]', msg);
        throw new Error('Service IA temporairement indisponible.');
    }
};

// ─── Service IA ───────────────────────────────────────────────────────────────
const aiService = {

    /**
     * 1. Analyse les tendances de vente pour une boutique
     */
    analyzeSales: async (storeId) => {
        // Récupérer les données réelles de ventes
        const topProducts = await OrderItem.findAll({
            attributes: [
                'produit_id',
                [sequelize.fn('SUM', sequelize.col('quantite')), 'total_vendu'],
                [sequelize.fn('SUM', sequelize.literal('"quantite" * "prix_unitaire_achat"')), 'revenu_total'],
            ],
            include: [{
                model: Product,
                as: 'produit',
                where: { boutique_id: storeId },
                attributes: ['nom_produit', 'prix_unitaire', 'stock_quantite']
            }],
            group: ['produit_id', 'produit.id'],
            order: [[sequelize.literal('total_vendu'), 'DESC']],
            limit: 10
        });

        if (topProducts.length === 0) {
            return {
                timestamp: new Date(),
                recommendations: [],
                ia_conseil: "Aucune vente enregistrée pour le moment. Commencez par enrichir votre catalogue avec des produits populaires.",
                global_trend: "En attente de données"
            };
        }

        const salesData = topProducts.map(p => ({
            produit: p.produit.nom_produit,
            total_vendu: parseInt(p.get('total_vendu')),
            prix_unitaire: parseFloat(p.produit.prix_unitaire),
            stock_restant: p.produit.stock_quantite
        }));

        const systemPrompt = `Tu es un expert en commerce électronique africain, spécialisé sur le marché guinéen. 
Tu analyses les données de vente d'une boutique en ligne sur BCA Connect (marketplace guinéenne).
Réponds TOUJOURS en JSON valide avec la structure suivante:
{
  "recommendations": [{"produit": "string", "insight": "string", "action": "string"}],
  "global_trend": "string",
  "ia_conseil": "string",
  "opportunite_marche": "string"
}`;

        const userMessage = `Analyse ces données de ventes et donne des recommandations stratégiques en français:
${JSON.stringify(salesData, null, 2)}`;

        const result = await callGroq(systemPrompt, userMessage, 600);
        return { timestamp: new Date(), ...result };
    },

    /**
     * 2. Calcule le score de confiance d'un utilisateur
     */
    analyzeTrust: async (userId) => {
        const completedOrders = await Order.count({ where: { utilisateur_id: userId, statut: 'payé' } });
        const cancelledOrders = await Order.count({ where: { utilisateur_id: userId, statut: 'annulé' } });

        const systemPrompt = `Tu es un système de scoring de confiance pour une marketplace africaine.
Réponds TOUJOURS en JSON valide avec la structure suivante:
{
  "score": number (0-150),
  "level": "string (Débutant/Standard/Premium/Expert)",
  "reliability": "string",
  "conseils": ["string"]
}`;

        const userMessage = `Calcule le score de confiance d'un utilisateur avec ces données:
- Commandes complétées: ${completedOrders}
- Commandes annulées: ${cancelledOrders}
- Ratio d'annulation: ${completedOrders > 0 ? Math.round((cancelledOrders / (completedOrders + cancelledOrders)) * 100) : 0}%
Donne un score équitable et des conseils pour améliorer son profil.`;

        return await callGroq(systemPrompt, userMessage, 400);
    },

    /**
     * 3. Prédiction des tendances de marché
     */
    getMarketTrends: async () => {
        const systemPrompt = `Tu es un analyste de marché expert en économie guinéenne et africaine.
Tu connais les saisons, les fêtes (Tabaski, Ramadan, Noël), et les habitudes des consommateurs guinéens.
Réponds TOUJOURS en JSON valide avec la structure suivante:
{
  "trends": [{"category": "string", "demand_score": number (0-100), "insight": "string", "periode": "string"}],
  "confidence": number (0-1),
  "resume": "string"
}`;

        const now = new Date();
        const userMessage = `Nous sommes le ${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}.
Donne les tendances de marché actuelles pour une marketplace en Guinée Conakry (BCA Connect).
Inclut: Électronique, Mode/Textile, Alimentation, Mobilier, Agriculture, Santé/Beauté, Transport.`;

        return await callGroq(systemPrompt, userMessage, 700);
    },

    /**
     * 4. Médiation IA pour les litiges
     */
    mediateDispute: async (disputeData) => {
        const systemPrompt = `Tu es un médiateur expert en litiges commerciaux sur une marketplace africaine (BCA Connect).
Tu analyses les faits de manière neutre et proposes une solution juste pour les deux parties.
Réponds TOUJOURS en JSON valide avec la structure suivante:
{
  "solution_proposee": "string",
  "score_gravite": number (0-1),
  "responsabilite": "acheteur|vendeur|partage|indeterminer",
  "action_recommandee": "string",
  "delai_resolution": "string"
}`;

        const userMessage = `Analyse ce litige et propose une médiation équitable:
Type: ${disputeData.type}
Description: ${disputeData.description}
Montant en jeu: ${disputeData.montant || 'inconnu'} GNF
Statut commande: ${disputeData.statut_commande || 'livré'}`;

        return await callGroq(systemPrompt, userMessage, 500);
    },

    /**
     * 5. Suggestion de prix pour un nouveau produit
     */
    suggestPrice: async (productData) => {
        const systemPrompt = `Tu es un expert en pricing pour le marché e-commerce guinéen.
Tu connais les fourchettes de prix habituelles en francs guinéens (GNF).
Réponds TOUJOURS en JSON valide avec la structure suivante:
{
  "prix_recommande": number,
  "fourchette_min": number,
  "fourchette_max": number,
  "justification": "string",
  "strategie": "string"
}`;

        const userMessage = `Propose un prix pour ce produit sur le marché guinéen:
Nom: ${productData.nom}
Catégorie: ${productData.categorie}
Description: ${productData.description || 'Non fournie'}`;

        return await callGroq(systemPrompt, userMessage, 400);
    }
};

module.exports = aiService;
