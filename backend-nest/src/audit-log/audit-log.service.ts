import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

const AUTEUR_SELECT = { id: true, nom_complet: true, email: true, role: true };

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(query: AuditLogQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? '', 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(query.limit ?? '', 10) || 30),
    );
    const offset = (page - 1) * limit;

    const where: Prisma.audit_logsWhereInput = {};
    if (query.niveau_alerte) where.niveau_alerte = query.niveau_alerte;
    if (query.utilisateur_id) where.utilisateur_id = query.utilisateur_id;
    if (query.adresse_ip)
      where.adresse_ip = { contains: query.adresse_ip, mode: 'insensitive' };
    if (query.search) {
      where.OR = [
        { action: { contains: query.search, mode: 'insensitive' } },
        { table_affectee: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.date_debut || query.date_fin) {
      where.createdAt = {};
      if (query.date_debut) where.createdAt.gte = new Date(query.date_debut);
      if (query.date_fin)
        where.createdAt.lte = new Date(`${query.date_fin}T23:59:59.999Z`);
    }

    const [total, logs] = await Promise.all([
      this.prisma.audit_logs.count({ where }),
      this.prisma.audit_logs.findMany({
        where,
        include: { utilisateurs: { select: AUTEUR_SELECT } },
        orderBy: { createdAt: query.sort === 'ancien' ? 'asc' : 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);

    return {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      logs,
    };
  }

  async getById(id: string) {
    const log = await this.prisma.audit_logs.findUnique({
      where: { id },
      include: { utilisateurs: { select: AUTEUR_SELECT } },
    });
    if (!log) throw new NotFoundException('Entrée introuvable.');
    return log;
  }

  // Vue de synthèse : sessions/IP distinctes par utilisateur sur les 30 derniers jours
  async getUserActivitySummary(userId: string) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const logs = await this.prisma.audit_logs.findMany({
      where: { utilisateur_id: userId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const ipSet = new Set<string>();
    // Réplique fidèlement l'original : table_affectee peut être null,
    // la coercition JS en clé d'objet le transforme en la chaîne "null".
    const actionCounts: Record<string, number> = {};
    for (const log of logs) {
      if (log.adresse_ip) ipSet.add(log.adresse_ip);
      const key = log.table_affectee ?? 'null';
      actionCounts[key] = (actionCounts[key] || 0) + 1;
    }

    return {
      total_actions_30j: logs.length,
      adresses_ip_distinctes: Array.from(ipSet),
      repartition_par_ressource: actionCounts,
      derniere_action: logs[0] || null,
    };
  }
}
