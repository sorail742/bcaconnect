import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// Équivalent de authorize(...roles) côté Express. L'admin passe toujours
// (bypass géré dans RolesGuard), pas besoin de le lister explicitement.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
