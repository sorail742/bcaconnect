import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { JwtPayload } from './jwt-payload.interface';

// Équivalent de authorize(...roles)/roleMiddleware côté Express — doit
// toujours s'exécuter après JwtAuthGuard (a besoin de request.user déjà
// posé). L'admin contourne systématiquement la vérification, comme dans
// backend/src/middlewares/authMiddleware.js.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const userRole = request.user?.role?.toLowerCase();
    if (userRole === 'admin') return true;

    const allowed = requiredRoles.map((r) => r.toLowerCase());
    if (!userRole || !allowed.includes(userRole)) {
      throw new ForbiddenException("Accès refusé : rôle insuffisant.");
    }
    return true;
  }
}
