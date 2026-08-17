import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Équivalent de optionalAuth côté Express (authMiddleware.js) : tente
// l'authentification si un jeton est présent, mais avale toute erreur
// (absent, invalide, expiré) et laisse toujours passer la requête sans
// req.user plutôt que de renvoyer 401 — contrairement à JwtAuthGuard.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(_err: unknown, user: TUser): TUser {
    return user;
  }
}
