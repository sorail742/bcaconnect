import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';
// Équivalent de grantAccess(permission) côté Express.
export const RequirePermission = (permission: string) => SetMetadata(PERMISSION_KEY, permission);
