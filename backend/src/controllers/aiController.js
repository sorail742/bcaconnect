const aiService = require('../services/aiService');
const { Store, Order, OrderItem, Wallet, User } = require('../models');
const axios = require('axios');

// Config Groq — centralisée ici pour le chat direct (les autres appels passent par aiService)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const aiController = {

    // 1. Insights de vente pour les fournisseurs (alimenté par Groq)
    getSalesInsights: async (req, res, next) => {
        try {
            const store = await Store.findOne({ where: { proprietaire_id: req.user.id } });
            if (!store) {
                return res.status(404).json({ ia_conseil: "Vous n'avez pas de boutique active." });
            }
            const insights = await aiService.analyzeSales(store.id);
            res.json(insights);
        } catch (error) {
            next(error);
        }
    },

    // 2. Analyse du score de confiance et conseils pour l'utilisateur
    getTrustAnalysis: async (req, res, next) => {
        try {
            const analysis = await aiService.analyzeTrust(req.user.id);
            res.json(analysis);
        } catch (error) {
            next(error);
        }
    },

    // 3. Tendances du marché local (Guinée)
    getMarketTrends: async (req, res, next) => {
        try {
            const trends = await aiService.getMarketTrends();
            res.json(trends);
        } catch (error) {
            next(error);
        }
    },

    // 4. Suggestion intelligente de prix lors de la création d'un produit
    suggestPrice: async (req, res, next) => {
        try {
            const { nom, categorie, description } = req.body;
            if (!nom || !categorie) {
                return res.status(400).json({ message: "Nom et catégorie requis." });
            }
            const suggestion = await aiService.getSmartPricing(nom, categorie, description);
            res.json(suggestion);
        } catch (error) {
            next(error);
        }
    },

    // 5. Médiation de litige assistée par IA
    mediateDispute: async (req, res, next) => {
        try {
            const { disputeId, details } = req.body;
            const mediation = await aiService.mediateDispute({ ...details, disputeId });
            res.json(mediation);
        } catch (error) {
            next(error);
        }
    },

    // 6. Chat libre avec l'assistant BCA (Optionnel : authentifié pour le contexte, sinon mode invité)
    chat: async (req, res, next) => {
        try {
            const { message } = req.body;
            if (!message) {
                return res.status(400).json({ message: "Message requis." });
            }

            // --- RÉCUPÉRATION DU CONTEXTE RÉEL (SÉCURISÉ) ---
            let contextData = {};
            if (req.user) {
                try {
                    const lastOrders = await Order.findAll({
                        where: { utilisateur_id: req.user.id },
                        limit: 3,
                        order: [['created_at', 'DESC']],
                        include: [{ model: OrderItem, as: 'details' }]
                    });

                    const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
                    const user = await User.findByPk(req.user.id);

                    contextData = {
                        user_name: user?.nom_complet || "Utilisateur",
                        wallet_balance: wallet?.solde_virtuel || 0,
                        trust_score: user?.score_confiance || 100,
                        last_orders: lastOrders.map(o => ({
                            id: o.id.slice(0, 8),
                            total: o.total_ttc,
                            frais_port: o.frais_port,
                            statut: o.statut,
                            items_count: o.details?.length || 0,
                            adresse: o.adresse_livraison,
                            date: o.created_at
                        }))
                    };
                } catch (ctxError) {
                    console.error('[AI Context Error]', ctxError.message);
                }
            } else {
                contextData = {
                    user_name: "Visiteur (Guest)",
                    wallet_balance: 0,
                    trust_score: 100,
                    last_orders: []
                };
            }

            // --- APPEL À GROQ VIA AXIOS (IPv4 FORCÉ) ---
            const response = await axios.post(GROQ_API_URL, {
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `Tu es BCA Assistant, l'assistant intelligent et collaborateur technique de BCA Connect.
TES DROITS DE COLLABORATEUR :
1. ANALYSE TECHNIQUE : Tu as accès aux données de l'utilisateur pour l'aider. 
2. DÉBOGAGE : Si l'utilisateur signale un problème sur une commande, vérifie les données réelles fournies dans le contexte ci-dessous.
3. LOGIQUE DE LIVRAISON : 
   - Conakry (Kaloum, Dixinn, Ratoma, Matam, Matoto) : 20 000 GNF base + 2 000 GNF par article.
   - Province : 50 000 GNF base minimum + 5 000 GNF par article.

CONTEXTE RÉEL DE L'UTILISATEUR (A ne pas divulguer tel quel, utilise-le pour tes analyses) :
- Nom : ${contextData.user_name || 'Inconnu'}
- Solde Portefeuille : ${contextData.wallet_balance || 0} GNF
- Score de confiance : ${contextData.trust_score || 100}%
- Commandes récentes : ${JSON.stringify(contextData.last_orders || [])}

Réponds toujours en français, de manière concise et très professionnelle.`
                    },
                    { role: 'user', content: message }
                ],
                max_tokens: 500,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            });

            const text = response.data.choices[0]?.message?.content;
            res.json({
                response: text || "Je n'ai pas pu générer une réponse.",
                usage: response.data.usage
            });
        } catch (error) {
            console.error('[AI Chat Error]', error.message);
            const errorMsg = error.response?.data?.error?.message || error.message || "Erreur inconnue";
            res.status(500).json({
                message: "Désolé, je suis momentanément indisponible.",
                error: errorMsg
            });
        }
    },

    // 7. Interpréter une requête de recherche
    interpretSearch: async (req, res, next) => {
        try {
            const { query, language = 'fr' } = req.body;
            if (!query) {
                return res.status(400).json({ message: "Requête requise." });
            }

            const response = await axios.post(GROQ_API_URL, {
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `Tu es un expert en interprétation de requêtes de recherche pour une plateforme e-commerce africaine.
Analyse la requête et retourne un JSON avec:
- interpretation: explication claire de ce que l'utilisateur cherche
- keywords: array de mots-clés pertinents
- category: catégorie principale (ex: "Électronique", "Vêtements", "Alimentation", etc.)

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`
                    },
                    { role: 'user', content: `Interprète cette recherche: "${query}"` }
                ],
                max_tokens: 300,
                temperature: 0.5
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            const content = response.data.choices[0]?.message?.content;
            const parsed = JSON.parse(content);
            
            res.json({
                data: parsed
            });
        } catch (error) {
            console.error('[Search Interpret Error]', error.message);
            res.status(500).json({
                message: "Erreur lors de l'interprétation de la recherche",
                error: error.message
            });
        }
    },

    // 8. Trouver des produits similaires
    findSimilarProducts: async (req, res, next) => {
        try {
            const { description } = req.body;
            if (!description) {
                return res.status(400).json({ message: "Description requise." });
            }

            const response = await axios.post(GROQ_API_URL, {
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `Tu es un expert en recommandation de produits.
Basé sur la description, suggère des mots-clés et catégories de produits similaires.
Réponds avec un JSON contenant:
- keywords: array de mots-clés
- categories: array de catégories
- suggestions: array de suggestions de produits

Réponds UNIQUEMENT avec le JSON.`
                    },
                    { role: 'user', content: `Trouve des produits similaires à: "${description}"` }
                ],
                max_tokens: 300,
                temperature: 0.5
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            const content = response.data.choices[0]?.message?.content;
            const parsed = JSON.parse(content);
            
            res.json({
                data: parsed
            });
        } catch (error) {
            console.error('[Similar Products Error]', error.message);
            res.status(500).json({
                message: "Erreur lors de la recherche de produits similaires",
                error: error.message
            });
        }
    },

    // 9. Analyser une image pour la recherche
    analyzeImage: async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "Image requise." });
            }

            // Convertir l'image en base64
            const imageBase64 = req.file.buffer.toString('base64');

            const response = await axios.post(GROQ_API_URL, {
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `Tu es un expert en analyse d'images pour e-commerce.
Analyse l'image et retourne un JSON avec:
- description: description détaillée de l'objet
- category: catégorie principale
- keywords: array de mots-clés
- similar_products: suggestions de produits similaires

Réponds UNIQUEMENT avec le JSON.`
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Analyse cette image et suggère des produits similaires'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${req.file.mimetype};base64,${imageBase64}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500,
                temperature: 0.5
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            });

            const content = response.data.choices[0]?.message?.content;
            const parsed = JSON.parse(content);
            
            res.json({
                data: parsed
            });
        } catch (error) {
            console.error('[Image Analysis Error]', error.message);
            res.status(500).json({
                message: "Erreur lors de l'analyse de l'image",
                error: error.message
            });
        }
    }
};

module.exports = aiController;
