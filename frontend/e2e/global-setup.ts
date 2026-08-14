import { chromium, type FullConfig } from '@playwright/test';
import { ACCOUNTS, authFile, type Role } from './fixtures/accounts';

/**
 * Se connecte une fois par rôle via la vraie UI de login, puis persiste le
 * storageState (cookies httpOnly + localStorage) pour que les specs
 * réutilisent la session au lieu de refaire un login UI à chaque test.
 * Voir https://playwright.dev/docs/auth
 *
 * Sélecteurs par type d'input (pas de label/id/testid sur le formulaire de
 * login actuellement — voir Phase 2 du plan de remédiation a11y) plutôt que
 * getByLabel, qui échouerait tant que les <label> ne sont pas associés.
 */
async function loginAndSave(browser: import('@playwright/test').Browser, baseURL: string, role: Role) {
  const { email, password } = ACCOUNTS[role];
  // Un contexte par rôle (léger) plutôt qu'un navigateur par rôle (coûteux) —
  // le lancement répété de chromium.launch() est ce qui rendait le setup
  // séquentiel initial très lent (~5 min pour 5 rôles).
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${baseURL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  // Signal générique de connexion réussie : on quitte /login. Les rôles
  // atterrissent sur des dashboards différents (getDashboardRoute côté app),
  // donc on n'attend pas une URL précise ici.
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20_000 });

  await context.storageState({ path: authFile(role) });
  await context.close();
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL as string;
  const browser = await chromium.launch();

  try {
    // Les 5 logins sont indépendants — les paralléliser plutôt que les
    // enchaîner réduit le setup de plusieurs minutes à quelques secondes.
    await Promise.all(
      (Object.keys(ACCOUNTS) as Role[]).map((role) => loginAndSave(browser, baseURL, role))
    );
  } finally {
    await browser.close();
  }
}
