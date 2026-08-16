import { PERMISSIONS } from './permissions.config';

// backend/src/config/permissions.js reste la matrice RBAC de référence tant
// que le module auth/user n'est pas migré ; PERMISSIONS ci-dessus en est un
// portage manuel (Nest ne peut pas importer un module CommonJS d'un autre
// projet npm au runtime). Ce test transforme une dérive silencieuse entre
// les deux fichiers — deux backends autorisant différemment le même rôle
// pour la même permission — en échec CI explicite, plutôt que de compter
// uniquement sur le commentaire dans permissions.config.ts.
describe('permissions.config.ts (parité avec backend/src/config/permissions.js)', () => {
  it('reste identique à la matrice RBAC Express', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { permissions: expressPermissions } = require('../../../backend/src/config/permissions.js');
    expect(PERMISSIONS).toEqual(expressPermissions);
  });
});
