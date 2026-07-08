const aiService = require('../services/aiService');
const { Store, Order, OrderItem, Wallet, User, Product, Category } = require('../models');
const axios = require('axios');
const { Op, Sequelize } = require('sequelize');

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
            const keywords = interpretation.keywords || [];
            
            let products = [];
            let suppliers = [];

            if (interpretation.search_type === 'supplier') {
                // Recherche de fournisseurs (Stores)
                const searchConditions = keywords.map(kw => ({
                    nom_boutique: { [Op.like]: `%${kw}%` }
                }));

                try {
                    suppliers = await Store.findAll({
                        where: searchConditions.length > 0 ? { [Op.or]: searchConditions } : {},
                        attributes: ['id', 'nom_boutique', 'description', 'logo_url', 'is_verified', 'rating'],
                        limit: 10
                    });
                } catch (dbError) {
                    console.error('[DB Supplier Error]', dbError);
                    throw dbError;
                }
            } else {
                // Recherche de produits classique
                const searchConditions = keywords.flatMap(kw => [
                    { nom_produit: { [Op.like]: `%${kw}%` } },
                    { description: { [Op.like]: `%${kw}%` } }
                ]);

                try {
                    products = await Product.findAll({
                        where: searchConditions.length > 0 ? { [Op.or]: searchConditions } : {},
                        include: [
                            { model: Store, as: 'boutique', attributes: ['nom_boutique', 'is_verified'] },
                            { model: Category, as: 'categorie', attributes: ['nom_categorie'] }
                        ],
                        limit: 20
                    });
                } catch (dbError) {
                    console.error('[DB Product Error]', dbError);
                    throw dbError;
                }
            }

            res.json({ 
                ...interpretation,
                products,
                suppliers 
            });
        } catch (error) {
            console.error('[AI Interpret Search Error]', error);
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

            // Modèle vision Groq actuel (les llama-3.2-*-vision-preview sont décommissionnés).
            // Llama 4 Scout est multimodal et supporté ; surchargeable via GROQ_VISION_MODEL.
            const VISION_MODEL = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
            const imageBase64 = req.file.buffer.toString('base64');

            let parsed = null;

            try {
                const response = await axios.post(GROQ_API_URL, {
                    model: VISION_MODEL,
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: `Tu es un expert en analyse d'images pour une marketplace B2B.
Analyse l'objet principal de l'image et retourne UNIQUEMENT un JSON brut :
{"description": "description courte de l'objet en français", "keywords": ["6 à 8 mots-clés français, du plus spécifique au plus général : nom de l'objet, synonymes courants, catégorie marchande (ex: électronique, meuble, véhicule, vêtement, outil, agriculture)"]}
Utilise des termes génériques susceptibles d'apparaître dans un catalogue (ex: pour une berline -> "voiture, véhicule, automobile, transport"). Ne réponds qu'avec le JSON, rien d'autre.`
                                },
                                {
                                    type: 'image_url',
                                    image_url: { url: `data:${req.file.mimetype};base64,${imageBase64}` }
                                }
                            ]
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.2
                    // ⚠️ PAS de response_format : les modèles vision ne le supportent pas
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 45000
                });

                const content = response.data.choices[0]?.message?.content;
                if (content) {
                    try {
                        parsed = JSON.parse(content.trim());
                    } catch (e) {
                        // Extraction JSON via regex si le modèle ajoute du texte autour
                        const jsonMatch = content.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            try { parsed = JSON.parse(jsonMatch[0]); } catch (e2) { /* ignore */ }
                        }
                    }
                }
            } catch (visionError) {
                // Le détail technique reste dans les logs serveur, jamais renvoyé au client.
                console.warn('[Vision AI Error]', visionError.response?.data?.error?.message || visionError.message);
                parsed = { description: null, keywords: [], visionUnavailable: true };
            }

            // Si l'IA n'a pas pu analyser, on renvoie un message neutre (pas d'erreur brute affichée).
            const visionFailed = !parsed || !parsed.description;
            if (visionFailed) {
                parsed = {
                    description: "Analyse d'image indisponible pour le moment.",
                    keywords: [],
                    visionUnavailable: true
                };
            }

            // --- RECHERCHE RÉELLE DES PRODUITS ---
            const keywordsRaw = parsed.keywords || [];
            
            // Nettoyer et séparer les mots-clés (minuscule, sans ponctuation, mots de > 2 lettres)
            let searchWords = [];
            keywordsRaw.forEach(k => {
                k.toLowerCase().split(/[\s,]+/).forEach(w => {
                    if (w.length > 2) searchWords.push(w);
                });
            });
            // Dédupliquer et ajouter "voiture" si le modèle a trouvé "automobile" etc (optionnel mais robuste)
            searchWords = [...new Set(searchWords)];

            // Correspondance par CATÉGORIE : un mot-clé large (ex. "véhicule") remonte
            // les produits de la catégorie correspondante même si le nom ne le contient pas.
            let matchedCategoryIds = [];
            if (searchWords.length > 0) {
                try {
                    const catConds = searchWords.map(kw =>
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('nom_categorie')), { [Op.like]: `%${kw}%` })
                    );
                    const cats = await Category.findAll({ where: { [Op.or]: catConds }, attributes: ['id'] });
                    matchedCategoryIds = cats.map(c => c.id);
                } catch (e) { /* non bloquant */ }
            }

            const isPostgres = Product.sequelize.getDialect() === 'postgres';
            const searchConditions = searchWords.flatMap(kw => {
                // On matche le NOM, la MARQUE et les MOTS-CLÉS (précis), pas la description
                // (souvent générique/boilerplate → faux positifs). La catégorie est gérée à part.
                const condition = [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Product.nom_produit')), { [Op.like]: `%${kw}%` }),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Product.marque')), { [Op.like]: `%${kw}%` })
                ];

                // Mots clés (JSON column)
                if (isPostgres) {
                    condition.push(Sequelize.where(Sequelize.cast(Sequelize.col('Product.mots_cles'), 'TEXT'), { [Op.iLike]: `%${kw}%` }));
                } else {
                    condition.push(Sequelize.where(Sequelize.col('Product.mots_cles'), { [Op.like]: `%${kw}%` }));
                }
                
                return condition;
            });

            // Ajouter les produits des catégories correspondantes.
            if (matchedCategoryIds.length > 0) {
                searchConditions.push({ categorie_id: { [Op.in]: matchedCategoryIds } });
            }

            let products = [];
            if (searchConditions.length > 0) {
                try {
                    products = await Product.findAll({
                        where: { [Op.or]: searchConditions },
                        include: [
                            { model: Store, as: 'boutique', attributes: ['nom_boutique', 'is_verified'] },
                            { model: Category, as: 'categorie', attributes: ['nom_categorie'] }
                        ],
                        limit: 20
                    });
                } catch (dbError) {
                    console.warn('[AI Search] Fallback to simple product search:', dbError.message);
                    products = await Product.findAll({
                        where: { [Op.or]: searchConditions },
                        limit: 10
                    });
                }
            }
            
            res.json({
                ...parsed,
                message: parsed.description,
                products: products
            });
        } catch (error) {
            console.error('[Image Analysis Error]', error.message);
            res.status(500).json({ message: "Erreur analyse image", error: error.message });
        }
    },
    // 10. Suggérer les détails complets d'un produit pour auto-fill
    suggestProductDetails: async (req, res, next) => {
        try {
            const { nom, imageAnalysis } = req.body;
            const details = await aiService.generateProductDetails(nom, imageAnalysis);
            res.json(details);
        } catch (error) {
            next(error);
        }
    },

    // 11. Suggérer une description pour une catégorie
    suggestCategoryDescription: async (req, res, next) => {
        try {
            const { nom } = req.body;
            const details = await aiService.generateCategoryDescription(nom);
            res.json(details);
        } catch (error) {
            next(error);
        }
    },

    // 11. Analyse de code pour le débogage de la plateforme
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
