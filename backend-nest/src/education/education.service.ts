import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { InternalBridgeService } from '../internal-bridge/internal-bridge.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { UpsertQuizDto } from './dto/upsert-quiz.dto';
import { JwtPayload } from '../auth/jwt-payload.interface';

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
}

const ROLE_AUDIENCE: Record<string, string> = {
  client: 'clients',
  fournisseur: 'fournisseurs',
  transporteur: 'transporteurs',
};

// Réplique education.service.js#audienceForRole : un invité (pas de user,
// via optionalAuth) ou un admin voit tout, sans filtre d'audience — ce
// n'est pas une lacune de sécurité introduite ici, c'est le comportement
// Express déjà en place (contenu de formation, pas de données sensibles).
function audienceForRole(role?: string): string | null {
  if (!role || role === 'admin') return null;
  return ROLE_AUDIENCE[role] || 'tous';
}

// Réplique backend/src/education/service/education.service.js — mêmes
// règles métier ("BCA Academy", cahier des charges 3.14), portées vers
// Prisma + le pont interne (Socket.IO, deletion-log).
@Injectable()
export class EducationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly internalBridge: InternalBridgeService,
  ) {}

  async getAllResources(user?: JwtPayload) {
    const audience = audienceForRole(user?.role);
    const resources = await this.prisma.educational_resources.findMany({
      where: audience ? { audience_cible: { in: ['tous', audience] as any } } : {},
      include: { educational_quizzes: { select: { id: true, passing_score: true } } },
      orderBy: { createdAt: 'desc' },
    });

    let progressByResource: Record<string, unknown> = {};
    if (user) {
      const progress = await this.prisma.educational_progress.findMany({
        where: { utilisateur_id: user.id, resource_id: { in: resources.map((r) => r.id) } },
      });
      progressByResource = Object.fromEntries(progress.map((p) => [p.resource_id, p]));
    }

    return resources.map((r) => ({
      ...r,
      has_quiz: !!r.educational_quizzes,
      ma_progression: progressByResource[r.id] || null,
    }));
  }

  async markViewed(id: string, userId: string) {
    const resource = await this.prisma.educational_resources.findUnique({ where: { id } });
    if (!resource) throw new NotFoundException('Ressource introuvable.');

    return this.upsertProgressDefaults(userId, id, { statut: 'vu' });
  }

  async getQuizForLearner(resourceId: string) {
    const quiz = await this.prisma.educational_quizzes.findUnique({ where: { resource_id: resourceId } });
    if (!quiz) throw new NotFoundException('Aucun quiz pour cette ressource.');

    const questions = (quiz.questions as unknown as QuizQuestion[]) || [];
    return {
      id: quiz.id,
      passing_score: quiz.passing_score,
      questions: questions.map(({ question, options }) => ({ question, options })),
    };
  }

  async submitQuiz(resourceId: string, reponses: number[], userId: string) {
    const resource = await this.prisma.educational_resources.findUnique({ where: { id: resourceId } });
    if (!resource) throw new NotFoundException('Ressource introuvable.');

    const quiz = await this.prisma.educational_quizzes.findUnique({ where: { resource_id: resource.id } });
    if (!quiz) throw new NotFoundException('Aucun quiz pour cette ressource.');

    const questions = (quiz.questions as unknown as QuizQuestion[]) || [];
    if (!Array.isArray(reponses) || reponses.length !== questions.length) {
      throw new BadRequestException(`${questions.length} réponse(s) attendue(s).`);
    }

    let correctCount = 0;
    const correction = questions.map((q, i) => {
      const isCorrect = reponses[i] === q.correct_index;
      if (isCorrect) correctCount += 1;
      return { question: q.question, correct_index: q.correct_index, votre_reponse: reponses[i], correct: isCorrect };
    });

    const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
    const passingScore = quiz.passing_score ?? 60;
    const passed = score >= passingScore;

    const progress = await this.upsertProgressDefaults(userId, resource.id, { statut: 'vu' });
    const updated = await this.prisma.educational_progress.update({
      where: { id: progress.id },
      data: {
        statut: passed ? 'quiz_reussi' : 'quiz_echoue',
        quiz_score: score,
        tentatives: (progress.tentatives ?? 0) + 1,
        completed_at: passed ? new Date() : progress.completed_at,
        updatedAt: new Date(),
      },
    });

    return { score, passed, passing_score: passingScore, correction, progress: updated };
  }

  getMyProgress(userId: string) {
    return this.prisma.educational_progress.findMany({
      where: { utilisateur_id: userId },
      include: { educational_resources: { select: { id: true, titre: true, type_contenu: true, tag: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  getQuizForAdmin(resourceId: string) {
    return this.prisma.educational_quizzes.findUnique({ where: { resource_id: resourceId } });
  }

  async upsertQuiz(resourceId: string, dto: UpsertQuizDto) {
    const resource = await this.prisma.educational_resources.findUnique({ where: { id: resourceId } });
    if (!resource) throw new NotFoundException('Ressource introuvable.');

    for (const q of dto.questions) {
      if (!q.question?.trim() || !Array.isArray(q.options) || q.options.length < 2) {
        throw new BadRequestException('Chaque question doit avoir un énoncé et au moins 2 options.');
      }
      if (!Number.isInteger(q.correct_index) || q.correct_index < 0 || q.correct_index >= q.options.length) {
        throw new BadRequestException('correct_index invalide pour une question.');
      }
    }

    const passingScore = dto.passing_score || 60;
    const existing = await this.prisma.educational_quizzes.findUnique({ where: { resource_id: resource.id } });

    if (existing) {
      return this.prisma.educational_quizzes.update({
        where: { id: existing.id },
        data: { questions: dto.questions as any, passing_score: passingScore, updatedAt: new Date() },
      });
    }

    return this.prisma.educational_quizzes.create({
      data: {
        id: randomUUID(),
        resource_id: resource.id,
        questions: dto.questions as any,
        passing_score: passingScore,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  getAllAdmin() {
    return this.prisma.educational_resources.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(dto: CreateResourceDto) {
    if (!dto.titre?.trim() || !dto.description?.trim() || !dto.url_contenu?.trim()) {
      throw new BadRequestException('titre, description et url_contenu sont requis.');
    }

    const resource = await this.prisma.educational_resources.create({
      data: {
        id: randomUUID(),
        titre: dto.titre.trim(),
        description: dto.description.trim(),
        type_contenu: dto.type_contenu || 'article',
        url_contenu: dto.url_contenu.trim(),
        audience_cible: dto.audience_cible || 'tous',
        tag: dto.tag?.trim() || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.internalBridge.emit('new_post', {
      id: resource.id,
      type: 'education',
      titre: resource.titre,
      message: `Nouveau contenu BCA Academy: ${resource.titre}`,
    });

    return resource;
  }

  async update(id: string, dto: UpdateResourceDto) {
    const existing = await this.prisma.educational_resources.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ressource introuvable.');

    return this.prisma.educational_resources.update({
      where: { id },
      data: {
        titre: dto.titre?.trim() ?? existing.titre,
        description: dto.description?.trim() ?? existing.description,
        type_contenu: dto.type_contenu ?? existing.type_contenu,
        url_contenu: dto.url_contenu?.trim() ?? existing.url_contenu,
        audience_cible: dto.audience_cible ?? existing.audience_cible,
        tag: dto.tag !== undefined ? dto.tag?.trim() || null : existing.tag,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string, user: JwtPayload, ip: string | null, userAgent: string | null, confirmationNom?: string) {
    const existing = await this.prisma.educational_resources.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ressource introuvable.');

    // educational_quizzes/progress sont en CASCADE en base — supprimer la
    // ressource supprime aussi son quiz et toute la progression liée,
    // comportement Postgres réel (vérifié via pg_constraint), pas une
    // simplification introduite ici.
    await this.prisma.educational_resources.delete({ where: { id } });

    await this.internalBridge.recordDeletion(
      'EducationalResource',
      { ...existing },
      {
        user: { id: user.id, nom_complet: user.nom_complet, email: user.email, role: user.role },
        ip,
        userAgent,
        confirmationNom,
      },
    );

    return { message: 'Ressource supprimée.' };
  }

  // Réplique educationRepository.findOrCreateProgress (Sequelize
  // findOrCreate) : retourne la ligne existante telle quelle, ou en crée
  // une avec les valeurs par défaut — jamais de mise à jour si elle existe
  // déjà, exactement comme findOrCreate.
  private async upsertProgressDefaults(userId: string, resourceId: string, defaults: { statut: string }) {
    const existing = await this.prisma.educational_progress.findUnique({
      where: { utilisateur_id_resource_id: { utilisateur_id: userId, resource_id: resourceId } },
    });
    if (existing) return existing;

    return this.prisma.educational_progress.create({
      data: {
        id: randomUUID(),
        utilisateur_id: userId,
        resource_id: resourceId,
        statut: defaults.statut,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
