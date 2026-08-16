import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Équivalent de authMiddleware/protect côté Express : 401 générique si le
// token est absent, invalide ou expiré (même message que jwtService.js
// pour ne pas exposer plus d'information côté Nest que côté Express).
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Jeton invalide ou expiré.');
    }
    return user;
  }
}
