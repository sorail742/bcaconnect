const API = process.env.API_URL || 'http://localhost:5000/api';

const accounts = {
  client: { email: 'client@test.com', password: 'Client@123' },
  banque: { email: 'banque@test.com', password: 'Banque@123' },
};

const results = [];
const ok = (n, c, d = '') => { results.push({ n, c }); console.log(`${c ? '✅' : '❌'} ${n}${d ? ` — ${d}` : ''}`); };

async function login(email, password) {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, mot_de_passe: password }),
  });
  const data = await r.json();
  return data.token;
}

async function run() {
  console.log('\n🔌 Tests API smoke — fonctionnalités récentes\n');

  const clientToken = await login(accounts.client.email, accounts.client.password);
  ok('Login client', !!clientToken);

  const headers = { Authorization: `Bearer ${clientToken}`, 'Content-Type': 'application/json' };

  const notifs = await fetch(`${API}/notifications`, { headers });
  const notifData = await notifs.json();
  ok('GET notifications', notifs.status === 200 && Array.isArray(notifData));
  if (notifData[0]) {
    ok('Champ titre (pas title)', !!notifData[0].titre);
    ok('Champ est_lu', 'est_lu' in notifData[0]);
  }

  const products = await fetch(`${API}/products?limit=1`);
  const prodData = await products.json();
  const pid = prodData?.products?.[0]?.id;
  ok('Produit catalogue', !!pid);

  const eligible = await fetch(`${API}/reviews/eligible?produit_id=${pid}`, { headers });
  ok('GET reviews/eligible', eligible.status === 200);

  const logout = await fetch(`${API}/auth/logout`, { method: 'POST', headers });
  ok('POST /auth/logout', logout.status === 200);

  const bankToken = await login(accounts.banque.email, accounts.banque.password);
  const pending = await fetch(`${API}/credits/pending`, { headers: { Authorization: `Bearer ${bankToken}` } });
  ok('GET credits/pending (banque)', pending.status === 200);

  const ads = await fetch(`${API}/ads?mine=1`, { headers: { Authorization: `Bearer ${await login(accounts.fournisseur?.email || 'fournisseur@test.com', 'Fournisseur@123')}` } });
  ok('GET ads?mine=1 (fournisseur)', ads.status === 200);

  const passed = results.filter((r) => r.c).length;
  console.log(`\n📊 API: ${passed}/${results.length}\n`);
  process.exit(passed < results.length ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
