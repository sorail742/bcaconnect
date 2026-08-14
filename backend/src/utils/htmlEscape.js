const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Échappe le texte libre injecté dans un message de notification HTML
 * (le frontend le rend via dangerouslySetInnerHTML — voir Notifications.jsx).
 * Utile pour tout champ de texte vendeur/utilisateur inséré tel quel, comme
 * Product.contenu_numerique (analyse concurrentielle #7).
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

module.exports = { escapeHtml };
