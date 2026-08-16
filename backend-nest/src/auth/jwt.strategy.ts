import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { parsePemFromEnv } from './jwt-key.util';
import { JwtPayload } from './jwt-payload.interface';

// Réplique backend/src/services/jwtService.js#verifyToken : RS256 strict,
// issuer/audience identiques, clé publique uniquement (Nest ne signe jamais
// de token tant que le module auth n'est pas migré).
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: parsePemFromEnv(configService.get<string>('JWT_PUBLIC_KEY')),
      algorithms: ['RS256'],
      issuer: 'bcaconnect.api',
      audience: 'bcaconnect.client',
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    // Même garde que jwtService.js : un token RS256 valide mais sans `id`
    // (jamais émis par ce projet, mais on ne fait pas confiance à la forme)
    // est rejeté explicitement plutôt que de laisser passer un req.user
    // incomplet.
    if (!payload?.id) {
      throw new UnauthorizedException('Token invalide: pas de user ID');
    }
    return payload;
  }
}
