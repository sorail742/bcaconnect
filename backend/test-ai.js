/**
 * BCA Connect — Test IA Groq
 * Lance avec: node test-ai.js
 */
require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const OK = '\x1b[32m✅\x1b[0m';
const ERR = '\x1b[31m❌\x1b[0m';
const INFO = '\x1b[36mℹ️ \x1b[0m';

async function callGroq(systemPrompt, userMessage, maxTokens = 300) {
    const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        max_tokens: maxTokens,
        temperature: 0.4,
        response_format: { type: 'json_object' }
    });
    return JSON.parse(response.choices[0]?.message?.content);
}

async function runTests() {
    console.log('\n' + '═'.repeat(60));
    console.log('  🤖 BCA Connect — Test d\'intégration IA (Groq)');
    console.log('═'.repeat(60));
    console.log(`${INFO} Modèle : ${MODEL}`);
    console.log(`${INFO} Clé   : ${process.env.GROQ_API_KEY?.slice(0, 12)}...`);
    console.log('');

    let passed = 0, failed = 0;

    // ── TEST 1 : Chat libre ─────────────────────────────────────────────────
    process.stdout.write('1. Chat Assistant BCA ............. ');
    try {
        const response = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                { role: 'system', content: 'Tu es BCA Assistant, assistant e-commerce guinéen. Réponds en français, brièvement.' },
                { role: 'user', content: 'Bonjour, comment puis-je créer une boutique sur BCA Connect ?' }
            ],
            max_tokens: 200,
            temperature: 0.7
        });
        const text = response.choices[0]?.message?.content;
        console.log(`${OK}`);
        console.log(`   → ${text?.slice(0, 120)}...`);
        passed++;
    } catch (e) {
        console.log(`${ERR} ${e.message}`);
        failed++;
    }

    // ── TEST 2 : Tendances marché (JSON) ────────────────────────────────────
    process.stdout.write('\n2. Tendances Marché Guinéen ....... ');
    try {
        const result = await callGroq(
            'Tu es analyste marché africain. Réponds en JSON avec { "trends": [...], "confidence": 0.8, "resume": "..." }',
            'Donne les 3 catégories de produits les plus demandées en Guinée en mars 2026.'
        );
        if (result.trends && Array.isArray(result.trends)) {
            console.log(`${OK}`);
            result.trends.slice(0, 2).forEach(t => console.log(`   → [${t.demand_score || '?'}] ${t.category}: ${t.insight}`));
            passed++;
        } else {
            throw new Error('Format JSON inattendu');
        }
    } catch (e) {
        console.log(`${ERR} ${e.message}`);
        failed++;
    }

    // ── TEST 3 : Suggestion de prix ─────────────────────────────────────────
    process.stdout.write('\n3. Suggestion de Prix ............. ');
    try {
        const result = await callGroq(
            'Tu es expert en pricing pour le marché guinéen. Réponds en JSON avec { "prix_recommande": number, "fourchette_min": number, "fourchette_max": number, "justification": "..." }',
            'Propose un prix pour: Nom=Samsung Galaxy A54, Catégorie=Électronique'
        );
        if (result.prix_recommande) {
            console.log(`${OK}`);
            console.log(`   → Prix recommandé : ${result.prix_recommande?.toLocaleString('fr-FR')} GNF`);
            console.log(`   → Fourchette      : ${result.fourchette_min?.toLocaleString('fr-FR')} — ${result.fourchette_max?.toLocaleString('fr-FR')} GNF`);
            passed++;
        } else {
            throw new Error('Format JSON inattendu');
        }
    } catch (e) {
        console.log(`${ERR} ${e.message}`);
        failed++;
    }

    // ── TEST 4 : Médiation de litige ────────────────────────────────────────
    process.stdout.write('\n4. Médiation de Litige ............ ');
    try {
        const result = await callGroq(
            'Tu es médiateur commercial. Réponds en JSON avec { "solution_proposee": "...", "score_gravite": 0.5, "responsabilite": "vendeur|acheteur|partage", "action_recommandee": "..." }',
            'Litige: type=qualite, description=Produit reçu abîmé et différent de la photo, montant=250000 GNF'
        );
        if (result.solution_proposee) {
            console.log(`${OK}`);
            console.log(`   → Solution  : ${result.solution_proposee?.slice(0, 100)}`);
            console.log(`   → Gravité   : ${result.score_gravite} | Responsabilité: ${result.responsabilite}`);
            passed++;
        } else {
            throw new Error('Format JSON inattendu');
        }
    } catch (e) {
        console.log(`${ERR} ${e.message}`);
        failed++;
    }

    // ── Résumé ──────────────────────────────────────────────────────────────
    console.log('\n' + '─'.repeat(60));
    console.log(`  Résultat : ${passed} réussis, ${failed} échoués`);
    if (failed === 0) {
        console.log('  \x1b[32m🎉 Intégration Groq IA opérationnelle !\x1b[0m');
    } else {
        console.log('  \x1b[33m⚠️  Certains tests ont échoué. Vérifiez la clé API.\x1b[0m');
    }
    console.log('═'.repeat(60) + '\n');
}

runTests().catch(err => {
    console.error('\n❌ Erreur fatale:', err.message);
    process.exit(1);
});
