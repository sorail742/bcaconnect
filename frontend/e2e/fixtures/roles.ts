import { test as base } from '@playwright/test';
import { authFile } from './accounts';

/**
 * Specs authentifiées : `test.use({ storageState: authFile('client') })`
 * (ou 'vendor' | 'carrier' | 'bank' | 'admin') en tête de fichier plutôt que
 * de refaire un login UI par test — le state est produit une fois par
 * global-setup.ts.
 */
export const test = base;
export { expect } from '@playwright/test';
export { authFile } from './accounts';
