import { test, expect } from '@playwright/test';

/**
 * Cahier des charges 1.12 — mode hors ligne (consultation catalogue en cache).
 *
 * Le catalogue de test CI est vide (seed:accounts ne crée que des comptes,
 * pas de produits) : plutôt que de dépendre de données produit seedées, on
 * injecte directement un produit dans le cache IndexedDB (`BCADatabase` /
 * store `products`, tenu par src/lib/db.js) — c'est exactement ce que
 * productService.getAll() y écrit lui-même après un fetch en ligne réussi.
 *
 * On ne recharge jamais le document pendant la coupure réseau : le service
 * worker PWA n'est actif qu'en build de production (VitePWA sans
 * `devOptions.enabled`), et le serveur e2e tourne en `npm run dev`. Une vraie
 * navigation document pendant `context.setOffline(true)` échouerait donc pour
 * une raison sans rapport avec le cache applicatif testé ici.
 */
test('le catalogue reste consultable hors ligne depuis le cache IndexedDB', async ({ page, context }) => {
  const cachedProduct = {
    id: 'e2e-offline-test-product',
    nom_produit: 'Produit test hors-ligne E2E',
    prix_unitaire: 12345,
    stock_quantite: 10,
    categorie_id: 'e2e-cat',
    store_id: 'e2e-store',
    image_url: null,
  };

  await page.goto('/marketplace', { waitUntil: 'domcontentloaded' });

  // Injecte le produit directement dans IndexedDB (même store que
  // offlineStorage.saveProducts), sans dépendre d'un fetch réseau réussi.
  await page.evaluate((product) => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('BCADatabase');
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('products', 'readwrite');
        tx.objectStore('products').put(product);
        tx.oncomplete = () => { db.close(); resolve(undefined); };
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
  }, cachedProduct);

  await context.setOffline(true);

  try {
    // useProducts (react-query) a un refetchInterval de 30s même en
    // background : on laisse ce refetch périodique se déclencher pendant
    // qu'on est hors ligne plutôt que de forcer une navigation. C'est ce
    // refetch qui doit retomber sur offlineStorage.getProducts() côté
    // productService.getAll() et afficher le produit mis en cache.
    await expect(page.getByText(cachedProduct.nom_produit)).toBeVisible({ timeout: 40_000 });
    await expect(page.getByText('Aucun produit ne correspond à vos filtres de recherche.')).not.toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
