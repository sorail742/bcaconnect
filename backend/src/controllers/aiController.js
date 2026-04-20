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

            // --- APPEL À GROQ VIA SERVICE (SÉCURISÉ) ---
            const systemPrompt = `Tu es BCA Assistant, l'assistant intelligent et collaborateur technique de BCA Connect.
TES DROITS DE COLLABORATEUR :
1. ANALYSE TECHNIQUE : Tu as accès aux données de l'utilisateur pour l'aider. 
2. DÉBOGAGE : Si l'utilisateur signale un problème sur une commande, vérifie les données réelles fournies dans le contexte ci-dessous.
3. LOGIQUE DE LIVRAISON : 
   - Conakry (Kaloum, Dixinn, Ratoma, Matam, Matoto) : 20 000 GNF base + 2 000 GNF par article.
   - Province : 50 000 GNF base minimum + 5 000 GNF par article.

CONTEXTE RÉEL DE L'UTILISATEUR :
- Nom : ${contextData.user_name || 'Inconnu'}
- Solde Portefeuille : ${contextData.wallet_balance || 0} GNF
- Score de confiance : ${contextData.trust_score || 100}%
- Commandes récentes : ${JSON.stringify(contextData.last_orders || [])}

Réponds toujours en français, de manière concise et très professionnelle.`;

            const aiResponse = await aiService.callGroq(systemPrompt, message, 500, false);

            res.json({
                response: aiResponse || "Je n'ai pas pu générer une réponse."
            });
        } catch (error) {
            console.error('[AI Chat Error]', error.message);
            res.status(500).json({
                message: "Désolé, je suis momentanément indisponible.",
                error: error.message
            });
        }
    },

    // 7. Interpréter une requête de recherche
    interpretSearch: async (req, res, next) => {
        try {
            const { query } = req.body;
            if (!query) {
                return res.status(400).json({ message: "Requête requise." });
            }

            const interpretation = await aiService.interpretSearch(query);
            res.json({ data: interpretation });
        } catch (error) {
            next(error);
        }
    },

    // 8. Trouver des produits similaires
    findSimilarProducts: async (req, res, next) => {
        try {
            const { description } = req.body;
            if (!description) {
                return res.status(400).json({ message: "Description requise." });
            }

            const results = await aiService.findSimilarProducts(description);
            res.json({ data: results });
        } catch (error) {
            next(error);
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
    },
    // 10. Analyse de code pour le débogage de la plateforme
    analyzeCode: async (req, res, next) => {
        try {
            const { code, context, language = 'javascript' } = req.body;
            if (!code) {
                return res.status(400).json({ message: "Code requis." });
            }

            const systemPrompt = `Tu es un expert senior en débogage et revue de code pour la plateforme BCA Connect.

STACK TECHNIQUE BCA CONNECT :
- Frontend : React 18, Vite, TailwindCSS, Framer Motion, Zustand (store panier), React Query (cache), React Router v6
- Backend : Node.js/Express v5, Sequelize ORM (PostgreSQL), Socket.io, JWT (access + refresh tokens), Multer
- IA : Groq API (LLaMA 3.3-70b), optionalAuth / authMiddleware
- Services : aiService.js, productService.js, authService.js, orderService.js, walletService.js
- Patterns utilisés : hooks custom (useCart, useAuth, useLanguage), intercepteurs Axios avec auto-refresh 401

TYPES DE BUGS À DÉTECTER :
1. React : clés manquantes dans les listes, useEffect sans dépendances, setState après unmount, mutation directe du state
2. Auth/Sécurité : routes non protégées, tokens exposés, CORS mal configuré
3. Async : Promises non gérées, race conditions, absence de cleanup
4. Sequelize : N+1 queries, associations manquantes (as: ...), transactions non atomiques
5. UX : chargements sans feedback, erreurs silencieuses, handlers onClick sans e.preventDefault()
6. Performance : re-renders inutiles, imports non optimisés, images sans lazy loading

FORMAT DE RÉPONSE (OBLIGATOIRE - Markdown complet) :
## 🔍 Analyse du Code

### ❌ Bugs Critiques
- **[NOM_BUG]** (ligne X) : Description précise + risque
  \`\`\`js
  // Code problématique
  \`\`\`
  ✅ **Fix** : 
  \`\`\`js
  // Code corrigé
  \`\`\`

### ⚠️ Avertissements
- Liste des problèmes non critiques mais importants

### 💡 Recommandations
- Bonnes pratiques à appliquer

### ✅ Score de Qualité : X/10`;

            const userMessage = `Analyse ce code ${language} de BCA Connect${context ? ` (Contexte: ${context})` : ''}:

\`\`\`${language}
${code}
\`\`\`

Trouve tous les bugs, failles de sécurité et mauvaises pratiques. Donne des corrections concrètes.`;

            const response = await aiService.callGroq(systemPrompt, userMessage, 1500, false);

            res.json({ analysis: response });
        } catch (error) {
            console.error('[Code Analysis Error]', error.message);
            res.status(500).json({
                message: "Erreur lors de l'analyse du code.",
                error: error.message
            });
        }
    }
};

module.exports = aiController;
