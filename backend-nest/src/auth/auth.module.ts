import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';

// Global : les guards/décorateurs (@Roles, @RequirePermission) doivent être
// utilisables depuis n'importe quel module métier migré, sans réimporter
// AuthModule partout — même principe que PrismaModule.
@Global()
@Module({
  imports: [PassportModule],
  providers: [JwtStrategy, JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard, PermissionsGuard],
  exports: [JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard, PermissionsGuard],
})
export class AuthModule {}
