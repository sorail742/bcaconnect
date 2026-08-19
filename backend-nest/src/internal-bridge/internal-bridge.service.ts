import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

// Appelle les routes internes exposées par Express (backend/src/internal/
// internal.route.js) pour les capacités que Nest ne possède pas encore
// pendant la migration progressive : Socket.IO (attaché au serveur HTTP
// Express) et le journal de suppression (deletion-log, encore Sequelize).
//
// N'échoue jamais bruyamment côté appelant : une panne du pont interne ne
// doit pas casser l'action métier principale côté Nest (même philosophie
// que deletionLogService.recordDeletion côté Express, qui avale ses
// propres erreurs).
@Injectable()
export class InternalBridgeService {
  private readonly logger = new Logger(InternalBridgeService.name);
  private readonly baseUrl: string;
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('EXPRESS_INTERNAL_URL') ?? 'http://localhost:5000';
    const secret = this.configService.get<string>('INTERNAL_SECRET');
    if (!secret) {
      throw new Error('INTERNAL_SECRET est requis (pont interne Express <-> NestJS).');
    }
    this.secret = secret;
  }

  private sign(body: unknown): string {
    return crypto.createHmac('sha256', this.secret).update(JSON.stringify(body)).digest('hex');
  }

  private async post(path: string, body: unknown): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/internal${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Signature': this.sign(body),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        this.logger.warn(`Appel interne ${path} refusé (${res.status}).`);
      }
    } catch (err) {
      this.logger.warn(`Pont interne injoignable (${path}) : ${(err as Error).message}`);
    }
  }

  emit(event: string, payload: unknown): Promise<void> {
    return this.post('/emit', { event, payload });
  }

  recordDeletion(
    table: string,
    record: Record<string, unknown>,
    meta: {
      user?: { id: string; nom_complet?: string; email?: string; role?: string } | null;
      ip?: string | null;
      userAgent?: string | null;
      confirmationNom?: string;
    },
  ): Promise<void> {
    return this.post('/record-deletion', { table, record, ...meta });
  }

  // Réplique certificationRepository.markStoreVerified/setVerificationLevel
  // (backend/src/certification/repository/certification.repository.js) :
  // boutiques.is_verified/niveau_verification restent des colonnes
  // possédées par Sequelize (table pas encore migrée) — Prisma n'y écrit
  // jamais directement, pour ne jamais faire coexister deux propriétaires
  // d'écriture sur une même table. Best-effort comme le reste du pont
  // interne : une panne temporaire ne doit pas faire échouer la revue
  // admin elle-même (déjà actée et persistée côté certifications) — juste
  // retarder la mise à jour du badge boutique, journalisée en warning.
  updateStoreVerification(fournisseurId: string, opts: { isVerified?: boolean; niveauVerification: string }): Promise<void> {
    return this.post('/verify-store', {
      fournisseurId,
      isVerified: opts.isVerified,
      niveauVerification: opts.niveauVerification,
    });
  }
}
