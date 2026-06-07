/**
 * Smoke test navigateur — BCA Connect
 * Usage: npx playwright test scripts/browser-smoke-test.mjs (or node with playwright)
 */
import { chromium } from 'playwright';

const BASE = process.env.FRONTEND_URL || 'http://localhost:3002';
const API = process.env.API_URL || 'http://localhost:5001/api';

const accounts = {
  client: { email: 'client@test.com', password: 'Client@123' },
  banque: { email: 'banque@test.com', password: 'Banque@123' },
  fournisseur: { email: 'fournisseur@test.com', password: 'Fournisseur@123' },
};

const results = [];

const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

async function login(page, role) {
  const { email, password } = accounts[role];
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

async function run() {
  console.log('\n🌐 Tests navigateur BCA Connect\n');
  console.log(`Frontend: ${BASE}`);
  console.log(`API: ${API}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Landing
    await page.goto(BASE);
    await page.waitForLoadState('domcontentloaded');
    record('Landing page charge', page.url().includes('localhost'));

    // 2. Marketplace public
    await page.goto(`${BASE}/marketplace`);
    await page.waitForLoadState('networkidle');
    const hasProducts = await page.locator('body').textContent();
    record('Marketplace accessible', hasProducts?.length > 100);

    // 3. Login client
    await login(page, 'client');
    record('Login client', !page.url().includes('/login'), page.url());

    // 4. Sidebar — Achats groupés
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState('networkidle');
    const sidebarText = await page.locator('aside').textContent();
    record('Sidebar client — Achats groupés', sidebarText?.includes('Achats groupés'));

    // 5. Orders page
    await page.goto(`${BASE}/orders`);
    await page.waitForLoadState('networkidle');
    record('Page /orders (pas 404)', !await page.locator('text=404').isVisible().catch(() => false));

    // 6. Notifications page
    await page.goto(`${BASE}/notifications`);
    await page.waitForLoadState('networkidle');
    const notifBody = await page.locator('body').textContent();
    record('Page notifications', notifBody?.toLowerCase().includes('notification'));

    // 7. Group purchase + wallet join flow
    const clientLogin = await page.request.post(`${API}/auth/login`, {
      data: { email: accounts.client.email, mot_de_passe: accounts.client.password },
    });
    const clientBody = await clientLogin.json();
    const clientAuth = { Authorization: `Bearer ${clientBody.token}` };

    const walletBefore = await page.request.get(`${API}/wallet/me`, { headers: clientAuth });
    const soldeAvant = parseFloat((await walletBefore.json())?.solde_virtuel || 0);

    await page.goto(`${BASE}/group-purchase`);
    await page.waitForLoadState('networkidle');
    record('Page achats groupés', page.url().includes('group-purchase'));
    record('Wallet client suffisant', soldeAvant >= 100000, `${soldeAvant} GNF`);

    const fournisseurLogin = await page.request.post(`${API}/auth/login`, {
      data: { email: accounts.fournisseur.email, mot_de_passe: accounts.fournisseur.password },
    });
    const fournisseurBody = await fournisseurLogin.json();
    const fournisseurAuth = { Authorization: `Bearer ${fournisseurBody.token}` };

    const campaignsRes = await page.request.get(`${API}/group-purchases`, { headers: fournisseurAuth });
    const campaigns = await campaignsRes.json();
    const openCampaign = campaigns?.find(
      (c) => c.statut === 'ouvert' && c.organisateur_id !== fournisseurBody.user?.id,
    );
    if (openCampaign) {
      const joinRes = await page.request.post(`${API}/group-purchases/${openCampaign.id}/join`, {
        data: { quantite: 1 },
        headers: fournisseurAuth,
      });
      const joinBody = await joinRes.json();
      record('Join achat groupé (API)', joinRes.status() === 201, `${joinRes.status()} ${joinBody?.message || ''}`);
    } else {
      record('Join achat groupé (API)', false, 'aucune campagne ouverte disponible');
    }

    // 8. Credit simulator redirect target
    await page.goto(`${BASE}/credits/simulate`);
    await page.waitForLoadState('networkidle');
    record('Simulateur crédit accessible', page.url().includes('simulate'));

    // 9. Login banque — sidebar
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await login(page, 'banque');
    await page.goto(`${BASE}/bank/dashboard`);
    await page.waitForLoadState('networkidle');
    const bankSidebar = await page.locator('aside').textContent();
    record('Sidebar banque — Crédits en attente', bankSidebar?.includes('Crédits'));
    record('Sidebar banque — pas menu client seul', bankSidebar?.includes('Partenaire') || bankSidebar?.includes('Crédits'));

    await page.goto(`${BASE}/bank/credits`);
    await page.waitForLoadState('networkidle');
    record('Page /bank/credits', page.url().includes('bank/credits'));

    // 10. Fournisseur — vendor ads
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await login(page, 'fournisseur');
    await page.goto(`${BASE}/vendor/ads`);
    await page.waitForLoadState('networkidle');
    const adsPage = await page.locator('body').textContent();
    record('Page /vendor/ads', page.url().includes('vendor/ads') && (adsPage?.includes('PUBLICIT') || adsPage?.includes('Publicit')));

    const vendorSidebar = await page.locator('aside').textContent();
    record('Sidebar fournisseur — Rapports', vendorSidebar?.includes('Rapports'));
    record('Sidebar fournisseur — Mes Publicités', vendorSidebar?.includes('Publicit'));

    // 11. Product page + avis tab
    const productsRes = await page.request.get(`${API}/products?limit=1`);
    const productsData = await productsRes.json();
    const productId = productsData?.products?.[0]?.id || productsData?.[0]?.id;
    if (productId) {
      await page.goto(`${BASE}/product/${productId}`);
      await page.waitForLoadState('networkidle');
      const avisTab = page.getByRole('button', { name: /Avis/i });
      if (await avisTab.count() > 0) {
        await avisTab.click();
        await page.waitForTimeout(800);
        const hasReviewSection = await page.locator('body').textContent();
        record('Onglet Avis produit', hasReviewSection?.includes('Avis') || hasReviewSection?.includes('avis'));
        record('Formulaire avis ou liste', hasReviewSection?.includes('Laisser un avis') || hasReviewSection?.includes('Aucun Avis'));
      } else {
        record('Onglet Avis produit', false, 'tab not found');
      }
    } else {
      record('Onglet Avis produit', false, 'no product from API');
    }

    // 12. Logout calls API (network intercept)
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await login(page, 'client');
    let logoutCalled = false;
    page.on('request', (req) => {
      if (req.url().includes('/auth/logout') && req.method() === 'POST') logoutCalled = true;
    });
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState('networkidle');
    const logoutBtn = page.locator('#btn-sidebar-logout');
    if (await logoutBtn.count() > 0) {
      await logoutBtn.click();
      await page.waitForTimeout(2500);
      record('Logout déclenche POST /auth/logout', logoutCalled);
      record('Logout redirige accueil', page.url().match(/\/$|\/login/) !== null);
    } else {
      record('Logout sidebar', false, 'button not found');
    }

  } catch (err) {
    console.error('💥 Erreur test:', err.message);
    record('Erreur fatale', false, err.message);
  } finally {
    await browser.close();
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n📊 Résultat: ${passed}/${results.length} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
