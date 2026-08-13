import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Rapport de charge k6 — cahier des charges 3.17.
 *
 * 3 scénarios, exécutés en séquence (startTime décalé) pour que les
 * métriques de chacun restent lisibles indépendamment :
 *   1. products    — GET /api/products (public, le plus gros trafic réaliste)
 *   2. auth_login  — POST /api/auth/login (bcrypt, gate de tout flux authentifié)
 *   3. checkout    — POST /api/orders (le plus critique métier, concurrence
 *                    B2B réaliste plus faible)
 *
 * Cible EXCLUSIVEMENT la stack docker-compose du runner CI — jamais la
 * production (voir loadtests/config/README.md). setup() crée ses propres
 * données (produit à bas prix, stock élevé) pour ne pas dépendre d'un état
 * préexistant et pour ne jamais épuiser le solde du portefeuille de test
 * pendant le run.
 */
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export const options = {
  scenarios: {
    products: {
      executor: 'constant-vus',
      vus: 100,
      duration: '2m',
      exec: 'productsScenario',
      startTime: '0s',
      tags: { scenario: 'products' },
    },
    auth_login: {
      executor: 'constant-vus',
      vus: 50,
      duration: '2m',
      exec: 'authLoginScenario',
      startTime: '2m30s',
      tags: { scenario: 'auth_login' },
    },
    checkout: {
      executor: 'constant-vus',
      vus: 25,
      duration: '2m',
      exec: 'checkoutScenario',
      startTime: '5m',
      tags: { scenario: 'checkout' },
    },
  },
  thresholds: {
    'http_req_duration{scenario:products}': ['p(95)<500'],
    'http_req_failed{scenario:products}': ['rate<0.01'],
    'http_req_duration{scenario:auth_login}': ['p(95)<300'],
    'http_req_failed{scenario:auth_login}': ['rate<0.01'],
    'http_req_duration{scenario:checkout}': ['p(95)<800'],
    'http_req_failed{scenario:checkout}': ['rate<0.01'],
  },
};

export function setup() {
  const vendorLogin = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: 'fournisseur@test.com', mot_de_passe: 'Fournisseur@123' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  if (vendorLogin.status !== 200) {
    throw new Error(`Setup: connexion fournisseur échouée (${vendorLogin.status}) — exécuter create-test-accounts.js avant k6.`);
  }
  const vendorToken = vendorLogin.json('accessToken');

  const categoriesRes = http.get(`${BASE_URL}/api/categories`);
  const categories = categoriesRes.json();
  const categoryId = Array.isArray(categories) && categories.length > 0 ? categories[0].id : null;
  if (!categoryId) {
    throw new Error('Setup: aucune catégorie disponible — ensureDefaultCategories() a-t-il tourné au démarrage du backend ?');
  }

  const productRes = http.post(
    `${BASE_URL}/api/products`,
    JSON.stringify({
      nom_produit: `k6 — Article de charge ${Date.now()}`,
      description: 'Produit créé par le scénario k6 (loadtests/scenarios/main.js) — sans rapport avec le catalogue réel.',
      prix_unitaire: 500,
      stock_quantite: 1000000,
      categorie_id: categoryId,
    }),
    { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorToken}` } },
  );
  if (productRes.status !== 201) {
    throw new Error(`Setup: création du produit de charge échouée (${productRes.status}) — ${productRes.body}`);
  }
  const productId = productRes.json('id') || productRes.json('produit.id');

  const clientLogin = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: 'client@test.com', mot_de_passe: 'Client@123' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  if (clientLogin.status !== 200) {
    throw new Error(`Setup: connexion client échouée (${clientLogin.status}).`);
  }
  const clientToken = clientLogin.json('accessToken');

  return { productId, clientToken };
}

export function productsScenario() {
  const res = http.get(`${BASE_URL}/api/products?page=1&limit=20`, { tags: { scenario: 'products' } });
  check(res, { 'produits : status 200': (r) => r.status === 200 });
  sleep(1);
}

export function authLoginScenario() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: 'client@test.com', mot_de_passe: 'Client@123' }),
    { headers: { 'Content-Type': 'application/json' }, tags: { scenario: 'auth_login' } },
  );
  check(res, { 'connexion : status 200': (r) => r.status === 200, 'connexion : token présent': (r) => !!r.json('accessToken') });
  sleep(1);
}

export function checkoutScenario(data) {
  const res = http.post(
    `${BASE_URL}/api/orders`,
    JSON.stringify({
      items: [{ productId: data.productId, quantity: 1 }],
      deliveryInfo: {
        nom: 'Client K6',
        telephone: '620000000',
        adresse: 'Rue de la Charge, Quartier k6, Conakry',
      },
      paymentMethod: 'wallet',
      type_livraison: 'standard',
    }),
    {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.clientToken}` },
      tags: { scenario: 'checkout' },
    },
  );
  check(res, { 'checkout : status 201': (r) => r.status === 201 });
  sleep(1);
}
