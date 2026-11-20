import { test, expect } from '@playwright/test';

/**
 * Spec de fumée — prouve que le runner Playwright fonctionne de bout en
 * bout (webServer démarré, navigateur, assertion) sans dépendance au
 * backend/DB seedés. Les 8 parcours Tier 1 (voir le plan) arrivent en
 * Phase 3, une fois le reste de l'outillage (Phase 0) validé.
 */
test('la page d\'accueil charge et affiche le logo BCA', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/BCA Connect/);
});
