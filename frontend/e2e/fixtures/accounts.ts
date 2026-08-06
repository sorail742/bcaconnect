/**
 * Comptes de test seedés par `backend/scripts/create-test-accounts.js`
 * (`npm run seed:accounts` côté backend). Mots de passe non uniformes —
 * copiés exactement depuis le script, ne pas "corriger" le pattern.
 */
export const ACCOUNTS = {
  admin: { email: 'admin@test.com', password: 'Admin@123' },
  vendor: { email: 'fournisseur@test.com', password: 'Fournisseur@123' },
  carrier: { email: 'transporteur@test.com', password: 'Transport@123' },
  client: { email: 'client@test.com', password: 'Client@123' },
  bank: { email: 'banque@test.com', password: 'Banque@123' },
} as const;

export type Role = keyof typeof ACCOUNTS;

export const authFile = (role: Role) => `e2e/.auth/${role}.json`;
