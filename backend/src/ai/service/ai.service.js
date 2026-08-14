const axios = require('axios');
const { Op, Sequelize } = require('sequelize');
const aiRepository = require('../repository/ai.repository');
const deletionLogService = require('../../deletion-log/service/deletionLog.service');
const categoryAttributes = require('../../constants/categoryAttributes');

const { getAttributesForCategory, buildAttributePromptBlock } = categoryAttributes;

// ─── Config Groq HTTP Direct ──────────────────────────────────────────────────
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const groqHeaders = () => ({
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json',
});

/**
 * Utilitaire : Appel Groq via axios HTTP direct
 */
const callGroq = async (systemPrompt, userMessage, maxTokens = 400, jsonMode = true, history = []) => {
    try {
        const payload = {
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                ...history.map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
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
            timeout: 45000
        });

        const content = response.data.choices[0]?.message?.content;

        if (jsonMode) {
            if (!content) {
                console.error('[AI Error] Groq returned empty content');
                throw new Error('Réponse IA vide.');
            }
            try {
                return JSON.parse(content);
            } catch (e) {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        return JSON.parse(jsonMatch[0]);
                    } catch (e2) {
                        console.error('[AI Parse Error] Extracted string is not valid JSON:', jsonMatch[0]);
                        throw new Error('Format de réponse IA invalide.');
                    }
                }
                throw new Error('Aucun JSON trouvé dans la réponse IA.');
            }
        }
        return content || "";
    } catch (error) {
        const msg = error.response?.data?.error?.message || error.message;
        console.error('[Groq AI Error]', msg);
        throw new Error('Service IA temporairement indisponible.');
    }
};

// ─── Moteur de Recherche Local (Fallback sans IA) ────────────────────────────
/**
 * Interprétation locale de la requête sans appel Groq.
 * Utilisée comme fallback quand Groq est indisponible ou timeout.
 */
const interpretSearchLocally = (query) => {
    const q = query.toLowerCase().trim();

    const greetingWords = ['bonjour', 'salut', 'bonsoir', 'hello', 'hi', 'coucou', 'hey'];
    const isGreeting = greetingWords.some(g => q.includes(g)) && q.split(' ').length <= 5;

    const supplierKeywords = ['fournisseur', 'grossiste', 'boutique', 'vendeur', 'fabricant', 'distributeur', 'store', 'marchand'];
    const isSupplierSearch = supplierKeywords.some(sk => q.includes(sk));

    const stopWords = new Set([
        'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
        'me', 'te', 'se', 'le', 'la', 'les', 'un', 'une', 'des',
        'du', 'de', 'da', 'et', 'ou', 'ni', 'car', 'mais', 'donc',
        'or', 'en', 'à', 'au', 'aux', 'sur', 'sous', 'dans', 'par',
        'pour', 'avec', 'sans', 'entre', 'vers', 'chez', 'que', 'qui',
        'quoi', 'dont', 'où', 'mon', 'ton', 'son', 'ma', 'ta', 'sa',
        'mes', 'tes', 'ses', 'notre', 'votre', 'leur', 'leurs',
        'cherche', 'trouve', 'trouver', 'chercher', 'veux', 'voudrais',
        'besoin', 'moi', 'avoir', 'est', 'sont', 'ai', 'as', 'a',
        'chercher', 'trouver', 'acheter', 'commander', 'voir', 'avoir',
        'une', 'un', 'des', 'les', 'the', 'of', 'and', 'is', 'in',
        'this', 'that', 'all', 'any', 'some', 'no', 'not', 'other', 'si', 'me'
    ]);

    const keywords = q
        .replace(/[^\w\sàâäéèêëîïôùûüç]/gi, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w))
        .slice(0, 5);

    if (isGreeting) {
        return {
            message: "Bonjour ! Je suis BCA IA Assistant. Dites-moi ce que vous cherchez et je trouve les meilleurs produits et fournisseurs pour vous.",
            search_type: 'product',
            keywords: [],
            category: '',
            thought_process: "Salutation détectée (mode hors-ligne).",
            is_greeting: true,
            _fallback: true
        };
    }

    const message = isSupplierSearch
        ? `Recherche de fournisseurs pour : ${keywords.join(', ') || query}`
        : `Voici les résultats pour : "${keywords.join(', ') || query}"`;

    return {
        message,
        search_type: isSupplierSearch ? 'supplier' : 'product',
        keywords,
        category: '',
        thought_process: `Analyse locale (mode hors-ligne) : ${isSupplierSearch ? 'intention fournisseur détectée' : 'recherche de produits'}, mots-clés extraits : [${keywords.join(', ')}].`,
        is_greeting: false,
        _fallback: true
    };
};

// ─── Service IA ───────────────────────────────────────────────────────────────
const aiService = {

    /**
     * 1. Analyse les tendances de vente pour une boutique
     */
    analyzeSales: async (storeId) => {
        const topProducts = await aiRepository.findTopSellingProductsForStore(storeId);

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
     * 1b. Insights de vente pour l'utilisateur connecté (résout d'abord sa boutique)
     */
    getSalesInsights: async (userId) => {
        const store = await aiRepository.findStoreByOwner(userId);
        if (!store) {
            return { outcome: 'no_store' };
        }
        const data = await aiService.analyzeSales(store.id);
        return { outcome: 'ok', data };
    },

    /**
     * 2. Calcule le score de confiance d'un utilisateur
     */
    analyzeTrust: async (userId) => {
        const completedOrders = await aiRepository.countOrdersByStatus(userId, 'payé');
        const cancelledOrders = await aiRepository.countOrdersByStatus(userId, 'annulé');

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

        try {
            return await callGroq(systemPrompt, userMessage, 400);
        } catch (error) {
            console.error('[AI Fallback] Groq failed, using fallback trust score.');
            const score = completedOrders > 0 ? Math.min(150, 50 + (completedOrders * 5) - (cancelledOrders * 10)) : 50;
            return {
                score: Math.max(0, score),
                level: score > 100 ? "Premium" : (score > 50 ? "Standard" : "Débutant"),
                reliability: "Score généré localement (IA indisponible).",
                conseils: [
                    "Continuez à compléter vos commandes.",
                    "Minimisez les annulations pour améliorer votre score."
                ]
            };
        }
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

        try {
            return await callGroq(systemPrompt, userMessage, 700);
        } catch (error) {
            console.warn('[AI Fallback] Groq failed for market trends. Returning local fallback.');
            return {
                trends: [
                    { category: "Produits Locaux", demand_score: 85, insight: "Forte demande sur le marché", periode: "Actuel" },
                    { category: "Électronique", demand_score: 65, insight: "Demande stable", periode: "Actuel" }
                ],
                confidence: 0.5,
                resume: "Tendances générées localement (IA indisponible)"
            };
        }
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
    getSmartPricing: async (nom, categorie, description) => {
        return aiService.suggestPrice({ nom, categorie, description });
    },

    /**
     * 6. Alias suggestPrice (appelé depuis aiController)
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
    },

    /**
     * 7. Interprète une requête de recherche utilisateur
     * Version avancée : Détection d'intention (Produits vs Fournisseurs)
     * Fallback local si Groq est indisponible/timeout
     */
    interpretSearch: async (query) => {
        const systemPrompt = `Tu es "BCA IA Assistant", l'intelligence de sourcing de BCA Connect.
Ton rôle est d'analyser l'intention de l'utilisateur.

Structure JSON attendue:
{
  "message": "Ta réponse directe et pro (Inspiré d'Accio BCA)",
  "search_type": "product|supplier",
  "keywords": ["mots", "clés"],
  "category": "catégorie",
  "thought_process": "Explication brève de ta réflexion pour arriver à ce résultat",
  "is_greeting": boolean
}

Note: Si l'utilisateur demande des "fournisseurs", des "grossistes" ou des "boutiques", search_type doit être "supplier".
Réponds UNIQUEMENT avec le JSON.`;

        const userMessage = `Requête: "${query}"`;

        try {
            return await callGroq(systemPrompt, userMessage, 600);
        } catch (groqError) {
            console.warn('[AI Fallback] Groq indisponible, utilisation du moteur local pour:', query);
            return interpretSearchLocally(query);
        }
    },

    /**
     * 7b. Interprète une requête de recherche ET exécute la recherche réelle (produits/fournisseurs)
     */
    interpretSearchRequest: async (query) => {
        const interpretation = await aiService.interpretSearch(query);

        let products = [];
        let suppliers = [];

        if (interpretation.search_type === 'supplier') {
            const keywords = interpretation.keywords || [];
            const searchConditions = keywords.map(kw => ({
                nom_boutique: { [Op.like]: `%${kw}%` }
            }));

            try {
                const storeRows = await aiRepository.findStoresByConditions(
                    searchConditions.length > 0 ? { [Op.or]: searchConditions } : {},
                    10,
                );

                // Note réelle calculée sur les avis produits de chaque boutique — la colonne
                // statique Store.rating est une valeur par défaut fictive tant qu'aucun avis
                // n'existe réellement (même correction qu'ailleurs dans l'app).
                const storeIds = storeRows.map((s) => s.id);
                const ratingRows = await aiRepository.findReviewRatingsForStores(storeIds);
                const ratingByStore = Object.fromEntries(
                    ratingRows.map((r) => [r.boutique_id, { rating: parseFloat(r.avg_note), nb_avis: parseInt(r.nb_avis, 10) }])
                );

                suppliers = storeRows.map((s) => {
                    const plain = s.toJSON();
                    const agg = ratingByStore[s.id];
                    plain.rating = agg ? Math.round(agg.rating * 10) / 10 : null;
                    plain.nb_avis = agg?.nb_avis || 0;
                    return plain;
                });
            } catch (dbError) {
                console.error('[DB Supplier Error]', dbError);
                throw dbError;
            }
        } else {
            const keywords = interpretation.keywords || [];
            const searchConditions = keywords.flatMap(kw => [
                { nom_produit: { [Op.like]: `%${kw}%` } },
                { description: { [Op.like]: `%${kw}%` } }
            ]);

            try {
                products = await aiRepository.findProductsForSearch(
                    searchConditions.length > 0 ? { [Op.or]: searchConditions } : {},
                    20,
                );
            } catch (dbError) {
                console.error('[DB Product Error]', dbError);
                throw dbError;
            }
        }

        return { ...interpretation, products, suppliers };
    },

    /**
     * 8. Trouve des produits similaires basés sur une description
     */
    findSimilarProducts: async (description) => {
        const systemPrompt = `Tu es un expert en recommandation de produits pour le marché guinéen.
Basé sur la description, suggère des mots-clés et catégories de produits similaires.
Réponds TOUJOURS en JSON valide:
{
  "keywords": ["array", "de", "mots-clés"],
  "categories": ["array", "de", "catégories"],
  "suggestions": ["array", "de", "produits", "suggérés"]
}`;

        const userMessage = `Trouve des produits similaires à: "${description}"`;
        return await callGroq(systemPrompt, userMessage, 400);
    },

    /**
     * 9. Génère les détails d'un produit (description, prix, catégorie, etc.)
     * à partir d'un nom et/ou d'une description d'image
     */
    generateProductDetails: async (name, imageAnalysis = '', categorie = '') => {
        const profile = getAttributesForCategory(categorie, name);
        const attributeBlock = profile
            ? buildAttributePromptBlock(profile)
            : '  "marque": "...",\n  "modele": "..."';

        const profileHint = profile
            ? `Profil détecté : "${profile.label}" (${profile.id}). Remplis UNIQUEMENT les clés attributs listées ci-dessous avec des valeurs réalistes pour ce type de produit.`
            : 'Déduis le type de produit (téléphone, ordinateur, vêtement, véhicule, etc.) et remplis les attributs correspondants.';

        const systemPrompt = `Tu es un assistant de saisie e-commerce expert pour BCA Connect en Guinée (style Alibaba multi-catégories).
Ta mission : aider le vendeur à remplir sa fiche produit RAPIDEMENT avec les BONNES caractéristiques selon le type de produit.
Un téléphone n'a PAS les mêmes champs qu'un ordinateur, qu'un vêtement ou qu'une voiture.

${profileHint}

Réponds TOUJOURS en JSON valide:
{
  "description": "string (Description attractive en français, 2-4 phrases)",
  "prix_suggere": number (GNF, réaliste pour le marché guinéen),
  "prix_fourchette_min": number (GNF, borne basse réaliste du marché),
  "prix_fourchette_max": number (GNF, borne haute réaliste du marché),
  "prix_justification": "string (courte justification du prix pour le marché guinéen, 1-2 phrases)",
  "categorie_suggeree": "string (catégorie BCA la plus pertinente)",
  "type_produit": "string (${categoryAttributes.ALL_PROFILE_IDS.join('|')}|generique)",
  "unite_suggeree": "string (Pièce, Kg, Paire, Carton...)",
  "mots_cles": ["string"],
  "attributs": {
${attributeBlock}
  }
}

Catégories BCA (38 segments) : Vêtements, Électronique, Téléphones, Informatique, Mode, Bijoux, Beauté, Maison & Jardin, Meubles, Sports, Chaussures, Bagages, Jouets, Hygiène, Santé, Animalerie, Bureau, Cadeaux, Alimentation, Véhicules, Pièces auto, Immobilier, Machines industrielles/commerciales/construction, Manutention, Équipements électriques, Sécurité, Énergies renouvelables, Électroménager, Matériaux, Bricolage, Emballage, Services.
Profils attributs disponibles : ${categoryAttributes.ALL_PROFILE_IDS.join(', ')}.
Réponds UNIQUEMENT avec le JSON.`;

        const userMessage = `Génère les détails pour ce produit:
Nom: ${name || 'Inconnu'}
Catégorie sélectionnée: ${categorie || 'Non définie'}
Analyse Image: ${imageAnalysis || 'Aucune image fournie'}`;

        const result = await callGroq(systemPrompt, userMessage, 1400);

        if (profile && result.attributs) {
            const allowed = new Set(profile.fields.map((f) => f.key));
            result.attributs = Object.fromEntries(
                Object.entries(result.attributs).filter(([k, v]) => allowed.has(k) && v != null && v !== '')
            );
        }

        return result;
    },

    /**
     * 10. Génère une description technique pour une catégorie
     */
    generateCategoryDescription: async (name) => {
        const systemPrompt = `Tu es un expert en taxonomie e-commerce pour BCA Connect.
Ta mission est de rédiger une description technique et attractive pour une CATÉGORIE de produits.
Cette description sera affichée aux acheteurs pour les aider à comprendre ce qu'ils trouveront dans ce segment.

Réponds TOUJOURS en JSON valide:
{
  "description": "string (Description professionnelle, environ 200 caractères, mettant en avant la qualité et la diversité)"
}

Réponds UNIQUEMENT avec le JSON.`;

        const userMessage = `Génère une description pour la catégorie: "${name}"`;
        return await callGroq(systemPrompt, userMessage, 300);
    },

    /**
     * 11. Génère les détails d'une ressource éducative (Admin)
     */
    generateEducationDetails: async (url, type) => {
        const systemPrompt = `Tu es un expert en éducation e-commerce et e-logistique pour BCA Connect.
Ta mission est de générer un titre accrocheur, une description éducative courte (2-3 phrases) et un mot-clé (tag) pour une ressource.
La ressource est de type "${type}". L'URL (ou le nom du fichier) est: "${url}".

Réponds TOUJOURS en JSON valide avec la structure:
{
  "titre": "string",
  "description": "string",
  "tag": "string (un seul mot court, ex: Tutoriel, Guide, Logistique, Vente)"
}

Réponds UNIQUEMENT avec le JSON.`;

        const userMessage = `Génère le titre, description et tag pour la ressource de type ${type} et d'URL ${url}`;
        return await callGroq(systemPrompt, userMessage, 300);
    },

    /**
     * Utilitaire exposé : Appel direct Groq (utilisé par ai.controller pour le chat)
     */
    callGroq,

    // ─── Chat assistant (orchestration + historique) ─────────────────────────
    async chat({ user, message, conversation_id }) {
        // --- HISTORIQUE DE CONVERSATION (utilisateurs connectés uniquement) ---
        // On ne poursuit/ne charge un historique que si l'utilisateur est authentifié :
        // un conversation_id fourni par un invité ne peut pas être vérifié comme lui appartenant.
        let conversation = null;
        let history = [];
        if (user) {
            if (conversation_id) {
                conversation = await aiRepository.findConversationById(conversation_id, user.id);
            }
            if (!conversation) {
                conversation = await aiRepository.createConversation(user.id, message.slice(0, 80));
            }

            const priorMessages = await aiRepository.findMessagesByConversation(conversation.id, { order: 'ASC', limit: 20 });
            history = priorMessages.map(m => ({ role: m.role, content: m.contenu }));

            await aiRepository.createMessage(conversation.id, 'user', message);
        }

        // --- RÉCUPÉRATION DU CONTEXTE RÉEL (SÉCURISÉ) ---
        let contextData = {};
        if (user) {
            try {
                const lastOrders = await aiRepository.findLastOrdersForUser(user.id, 3);
                const wallet = await aiRepository.findWalletByUserId(user.id);
                const userRecord = await aiRepository.findUserById(user.id);

                contextData = {
                    user_name: userRecord?.nom_complet || "Utilisateur",
                    wallet_balance: wallet?.solde_virtuel || 0,
                    trust_score: userRecord?.score_confiance || 100,
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

        const aiResponse = await callGroq(systemPrompt, message, 500, false, history);

        if (conversation) {
            await aiRepository.createMessage(conversation.id, 'assistant', aiResponse || "Je n'ai pas pu générer une réponse.");
        }

        return {
            response: aiResponse || "Je n'ai pas pu générer une réponse.",
            conversation_id: conversation?.id || null
        };
    },

    // ─── Historique réel des discussions IA (sidebar façon ChatGPT/Gemini) ────
    async getConversations(userId) {
        const conversations = await aiRepository.findConversationsByUser(userId, 50);
        const ids = conversations.map((c) => c.id);
        const messages = await aiRepository.findMessagesByConversationIds(ids);
        const lastByConv = {};
        for (const m of messages) {
            if (!lastByConv[m.conversation_id]) lastByConv[m.conversation_id] = m;
        }
        return conversations
            .map((c) => {
                const last = lastByConv[c.id];
                return {
                    id: c.id,
                    titre: c.titre || 'Nouvelle discussion',
                    createdAt: c.createdAt,
                    derniere_activite: last?.created_at || c.createdAt,
                    preview: last ? last.contenu.slice(0, 100) : null,
                };
            })
            .sort((a, b) => new Date(b.derniere_activite) - new Date(a.derniere_activite));
    },

    // ─── Messages complets d'une discussion IA (rechargement au clic dans l'historique) ───
    async getConversationMessages(userId, conversationId) {
        const conversation = await aiRepository.findConversationById(conversationId, userId);
        if (!conversation) return null;

        const messages = await aiRepository.findMessagesByConversation(conversation.id, { order: 'ASC' });
        return { conversation, messages };
    },

    // ─── Supprimer une discussion IA (journalisée dans l'historique des suppressions) ───
    async deleteConversation(userId, conversationId, req) {
        const conversation = await aiRepository.findConversationById(conversationId, userId);
        if (!conversation) return null;

        const messages = await aiRepository.findMessagesByConversation(conversation.id);
        await deletionLogService.recordDeletion('AiConversation', conversation, {
            req,
            extra: { messages: messages.map((m) => m.toJSON()) },
        });

        await aiRepository.destroyMessagesByConversation(conversation.id);
        await aiRepository.destroyConversation(conversation);
        return true;
    },

    // ─── Analyse d'une image pour la recherche ────────────────────────────────
    async analyzeImageSearch(file) {
        // Modèle vision Groq actuel (les llama-3.2-*-vision-preview sont décommissionnés).
        // Llama 4 Scout est multimodal et supporté ; surchargeable via GROQ_VISION_MODEL.
        const VISION_MODEL = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
        const imageBase64 = file.buffer.toString('base64');

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
                                image_url: { url: `data:${file.mimetype};base64,${imageBase64}` }
                            }
                        ]
                    }
                ],
                max_tokens: 300,
                temperature: 0.2
                // ⚠️ PAS de response_format : les modèles vision ne le supportent pas
            }, {
                headers: groqHeaders(),
                timeout: 45000
            });

            const content = response.data.choices[0]?.message?.content;
            if (content) {
                try {
                    parsed = JSON.parse(content.trim());
                } catch (e) {
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
        searchWords = [...new Set(searchWords)];

        // Correspondance par CATÉGORIE : un mot-clé large (ex. "véhicule") remonte
        // les produits de la catégorie correspondante même si le nom ne le contient pas.
        let matchedCategoryIds = [];
        if (searchWords.length > 0) {
            try {
                const catConds = searchWords.map(kw =>
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('nom_categorie')), { [Op.like]: `%${kw}%` })
                );
                const cats = await aiRepository.findCategoriesByConditions({ [Op.or]: catConds });
                matchedCategoryIds = cats.map(c => c.id);
            } catch (e) { /* non bloquant */ }
        }

        const isPostgres = aiRepository.getProductDialect() === 'postgres';
        const searchConditions = searchWords.flatMap(kw => {
            // On matche le NOM, la MARQUE et les MOTS-CLÉS (précis), pas la description
            // (souvent générique/boilerplate → faux positifs). La catégorie est gérée à part.
            const condition = [
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Product.nom_produit')), { [Op.like]: `%${kw}%` }),
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Product.marque')), { [Op.like]: `%${kw}%` })
            ];

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
                products = await aiRepository.findProductsForSearch({ [Op.or]: searchConditions }, 20);
            } catch (dbError) {
                console.warn('[AI Search] Fallback to simple product search:', dbError.message);
                products = await aiRepository.findProductsSimple({ [Op.or]: searchConditions }, 10);
            }
        }

        return { ...parsed, message: parsed.description, products };
    },

    // ─── Analyse de code pour le débogage de la plateforme ───────────────────
    async analyzeCode({ code, context, language = 'javascript' }) {
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

        const response = await callGroq(systemPrompt, userMessage, 1500, false);

        return { analysis: response };
    },
};

module.exports = aiService;
