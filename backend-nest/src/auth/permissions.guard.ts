import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from './permission.decorator';
import { hasPermission } from './permissions.config';
import { JwtPayload } from './jwt-payload.interface';

// Équivalent de grantAccess(permission) côté Express — doit toujours
// s'exécuter après JwtAuthGuard. Utilise la même matrice RBAC
// (permissions.config.ts, porté depuis backend/src/config/permissions.js).
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    if (!hasPermission(request.user?.role, requiredPermission)) {
      throw new ForbiddenException('Accès refusé : permission manquante.');
    }
    return true;
  }
}
