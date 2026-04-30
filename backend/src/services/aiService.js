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
            timeout: 45000
        });

        const content = response.data.choices[0]?.message?.content;
        
        if (jsonMode) {
            if (!content) {
                console.error('[AI Error] Groq returned empty content');
                throw new Error('Réponse IA vide.');
            }
            try {
                // Tenter un parse direct
                return JSON.parse(content);
            } catch (e) {
                // Si échec, tenter d'extraire le JSON via regex (au cas où il y a du texte autour)
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

    // Mots-clés indiquant une salutation
    const greetingWords = ['bonjour', 'salut', 'bonsoir', 'hello', 'hi', 'coucou', 'hey'];
    const isGreeting = greetingWords.some(g => q.includes(g)) && q.split(' ').length <= 5;

    // Détection d'intention : Fournisseur vs Produit
    const supplierKeywords = ['fournisseur', 'grossiste', 'boutique', 'vendeur', 'fabricant', 'distributeur', 'store', 'marchand'];
    const isSupplierSearch = supplierKeywords.some(sk => q.includes(sk));

    // Mots vides français à exclure des mots-clés
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

    // Extraction des mots-clés significatifs
    const keywords = q
        .replace(/[^\w\sàâäéèêëîïôùûüç]/gi, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w))
        .slice(0, 5); // Max 5 mots-clés

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
        // Récupérer les données réelles de ventes
        const topProducts = await OrderItem.findAll({
            attributes: [
                'produit_id',
                [sequelize.fn('SUM', sequelize.col('quantite')), 'total_vendu'],
                [sequelize.fn('SUM', sequelize.literal('quantite * prix_unitaire_achat')), 'revenu_total'],
            ],
            include: [{
                model: Product,
                as: 'produit',
                where: { boutique_id: storeId },
                attributes: ['nom_produit', 'prix_unitaire', 'stock_quantite']
            }],
            group: ['OrderItem.produit_id', 'produit.id'],
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
  "message": "Ta réponse directe et pro (Inspiré d'Accio Alibaba)",
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
            // ─── FALLBACK LOCAL : Groq indisponible / timeout ─────────────────
            console.warn('[AI Fallback] Groq indisponible, utilisation du moteur local pour:', query);
            return interpretSearchLocally(query);
        }
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
    generateProductDetails: async (name, imageAnalysis = '') => {
        const systemPrompt = `Tu es un assistant de saisie e-commerce expert pour BCA Connect en Guinée.
Ta mission est d'aider le vendeur à remplir sa fiche produit RAPIDEMENT.
Basé sur le NOM du produit ou l'ANALYSE D'IMAGE fournie, génère des données réalistes et professionnelles.

Réponds TOUJOURS en JSON valide avec la structure suivante:
{
  "description": "string (Description attractive et détaillée en français)",
  "prix_suggere": number (en GNF, réaliste pour le marché guinéen),
  "categorie_suggeree": "string (Une des catégories Alibaba standards)",
  "unite_suggeree": "string (ex: Pièce, kg, Paire, Carton, Ensemble)",
  "mots_cles": ["string", "string"],
  "caracteristiques": [{"nom": "string", "valeur": "string"}]
}

Liste des catégories standards autorisées:
"Vêtements & Accessoires", "Électronique grand public", "Maison & Jardin", "Sports & Loisirs", 
"Bijoux, Lunettes & Montres", "Produits de beauté", "Chaussures & Accessoires", "Médical & Santé",
"Machines industrielles", "Équipements et machines commerciaux", "Machines pour le Bâtiment & la Construction",
"Construction & Immobilier", "Meubles", "Lumière & Éclairage", "Électroménager",
"Fournitures & Outils auto", "Pièces & Accessoires pour véhicules", "Bricolage & Quincaillerie",
"Énergies renouvelables", "Équipements & Fournitures Électriques", "Sûreté & sécurité",
"Manutention", "Instrument & Équipement de test", "Transmission d'énergie",
"Composants électroniques", "Véhicules et transport", "Agriculture, Aliments & Boissons",
"Matières premières", "Services de fabrication", "Service"

Réponds UNIQUEMENT avec le JSON.`;

        const userMessage = `Génère les détails pour ce produit:
Nom: ${name || 'Inconnu'}
Analyse Image: ${imageAnalysis || 'Aucune image fournie'}`;

        return await callGroq(systemPrompt, userMessage, 800);
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
     * Utilitaire exposé : Appel direct Groq (utilisé par aiController.chat)
     */
    callGroq
};

module.exports = aiService;
