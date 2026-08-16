import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtPayload } from './auth/jwt-payload.interface';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Preuve de connectivité Prisma/Postgres pour la vérification de la Phase 0
  // (cf. plan de migration) — requête réelle contre la base partagée avec
  // Sequelize, pas un simple ping applicatif.
  @Get('health')
  async health() {
    const [{ count }] = await this.prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*)::int AS count FROM webinaires`;
    return { status: 'ok', database: 'connected', webinaires_count: Number(count) };
  }

  // Preuve que le JwtAuthGuard Nest accepte un token émis par Express (même
  // clé publique, même issuer/audience) — cf. vérification Phase 0.
  @Get('health/protected')
  @UseGuards(JwtAuthGuard)
  healthProtected(@Req() req: Request & { user: JwtPayload }) {
    return { status: 'ok', user: { id: req.user.id, email: req.user.email, role: req.user.role } };
  }
}
