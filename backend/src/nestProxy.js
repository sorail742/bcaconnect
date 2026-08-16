const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Proxy vers le service NestJS (migration progressive, cahier des charges
 * "backend totalement NestJS") — voir le plan de migration pour la
 * stratégie de cohabitation.
 *
 * Cutover d'un module : dans app.js, remplacer
 * `apiRouter.use('/<module>', require('./<module>/routes/<module>.route'))`
 * par `apiRouter.use('/<module>', createNestProxy())` — même position dans
 * la liste, rien d'autre à changer.
 *
 * `pathRewrite` reconstruit le chemin à partir de `req.originalUrl` (jamais
 * modifié par Express) plutôt que de l'argument `path` fourni par
 * http-proxy-middleware (qui correspond à `req.url`, déjà amputé du
 * préfixe de montage par Express — que ce montage soit fait directement
 * sur `app` ou imbriqué dans un routeur, Express retire systématiquement
 * le segment déjà matché). Ignorer `req.originalUrl` ici forwarderait
 * `/` à Nest au lieu de `/<module>`, quel que soit l'endroit où ce
 * middleware est monté.
 *
 * L'en-tête Authorization est transmis tel quel (comportement par défaut
 * de http-proxy-middleware) : le token RS256 émis par Express reste
 * vérifiable côté Nest sans aucune transformation ici.
 *
 * `on.proxyReq` réinjecte le corps de la requête : `express.json()` (app.js)
 * a déjà consommé le flux HTTP entrant avant que ce middleware ne s'exécute
 * (il est monté après, dans apiRouter) — sans ça, toute requête POST/PUT
 * reste bloquée indéfiniment côté Nest, qui attend un corps qui n'arrivera
 * jamais (le flux original est vide à ce stade). Se déclenche dès que
 * `req.body` est un objet défini (même `{}` — un body JSON vide reste un
 * body reçu, avec un Content-Length d'origine non nul) ; seule l'absence
 * totale de body (GET, DELETE sans body — express.json() ne pose alors
 * jamais `req.body`) saute la réécriture.
 *
 * `on.error` évite qu'une requête reste bloquée jusqu'au timeout si le
 * service Nest est injoignable (pas encore démarré, environnement où il
 * n'est pas déployé) — 503 explicite plutôt qu'un hang silencieux.
 */
function createNestProxy() {
    const target = process.env.NEST_BACKEND_URL || 'http://localhost:4001';
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: (_path, req) => req.originalUrl.replace(/^\/api/, ''),
        on: {
            proxyReq: (proxyReq, req) => {
                if (req.body === undefined || req.body === null) return;
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            },
            error: (err, req, res) => {
                if (res.headersSent) return;
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Module en migration temporairement indisponible.' }));
            },
        },
    });
}

module.exports = { createNestProxy };
