import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { generateKeyPairSync, randomUUID } from 'crypto';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const TEST_PREFIX = `e2e-edu-${Date.now()}`;

describe('EducationController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let signToken: (payload: Record<string, unknown>) => string;
  const createdIds: string[] = [];
  // educational_progress.utilisateur_id porte une vraie contrainte FK vers
  // utilisateurs (ON DELETE CASCADE, vérifié via pg_constraint) —
  // contrairement au pont deletion-log (qui avale silencieusement une FK
  // invalide), markViewed/submitQuiz échoueraient en 500 avec un id
  // synthétique. On crée donc un utilisateur jetable réel en base pour ces
  // tests précis, supprimé dans afterAll.
  let realUserId: string;

  beforeAll(async () => {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    });
    process.env.JWT_PUBLIC_KEY = publicKey;

    signToken = (payload) =>
      jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '15m',
        issuer: 'bcaconnect.api',
        audience: 'bcaconnect.client',
        subject: String(payload.id),
      });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    realUserId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO utilisateurs (id, nom_complet, email, telephone, mot_de_passe, role, created_at, updated_at)
      VALUES (${realUserId}::uuid, ${'E2E Education Client'}, ${`${TEST_PREFIX}@bca.gn`}, ${`+224${Date.now()}`}, ${'unused'}, ${'client'}, now(), now())
    `;
  });

  afterAll(async () => {
    const admin = signToken({ id: randomUUID(), email: 'cleanup@bca.gn', role: 'admin', nom_complet: 'Cleanup' });
    for (const id of createdIds) {
      await request(app.getHttpServer()).delete(`/education/${id}`).set('Authorization', `Bearer ${admin}`).catch(() => {});
    }
    // educational_progress est en CASCADE sur utilisateur_id : supprimer
    // l'utilisateur nettoie aussi toute progression restante s'il en reste.
    await prisma.$executeRaw`DELETE FROM utilisateurs WHERE id = ${realUserId}::uuid`;
    await app.close();
  });

  const adminToken = () => signToken({ id: randomUUID(), email: 'admin-e2e@bca.gn', role: 'admin', nom_complet: 'Admin E2E' });
  const clientToken = () => signToken({ id: realUserId, email: `${TEST_PREFIX}@bca.gn`, role: 'client', nom_complet: 'E2E Education Client' });
  const fournisseurToken = () => signToken({ id: randomUUID(), email: 'fournisseur-e2e@bca.gn', role: 'fournisseur', nom_complet: 'Fournisseur E2E' });

  it('GET /education est public (sans jeton) -> 200', () => {
    return request(app.getHttpServer()).get('/education').expect(200);
  });

  it('GET /education/admin sans jeton -> 401 ; en tant que client -> 403', async () => {
    await request(app.getHttpServer()).get('/education/admin').expect(401);
    await request(app.getHttpServer()).get('/education/admin').set('Authorization', `Bearer ${clientToken()}`).expect(403);
  });

  it('POST /education sans jeton -> 401', () => {
    return request(app.getHttpServer())
      .post('/education')
      .send({ titre: `${TEST_PREFIX}-refuse`, description: 'x', url_contenu: 'https://x.test' })
      .expect(401);
  });

  it("cycle complet : ressource ciblée fournisseurs, invisible pour un client, visible pour son audience", async () => {
    const admin = adminToken();

    const createRes = await request(app.getHttpServer())
      .post('/education')
      .set('Authorization', `Bearer ${admin}`)
      .send({
        titre: `${TEST_PREFIX}-fournisseurs`,
        description: 'Ressource ciblée fournisseurs',
        url_contenu: 'https://academy.test/guide',
        audience_cible: 'fournisseurs',
        type_contenu: 'guide',
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body.createdAt).toBeDefined();
    const resourceId = createRes.body.id as string;
    createdIds.push(resourceId);

    const clientList = await request(app.getHttpServer()).get('/education').set('Authorization', `Bearer ${clientToken()}`);
    expect(clientList.body.some((r: { id: string }) => r.id === resourceId)).toBe(false);

    const fournisseurList = await request(app.getHttpServer()).get('/education').set('Authorization', `Bearer ${fournisseurToken()}`);
    const found = fournisseurList.body.find((r: { id: string }) => r.id === resourceId);
    expect(found).toBeDefined();
    expect(found.has_quiz).toBe(false);

    const updateRes = await request(app.getHttpServer())
      .put(`/education/${resourceId}`)
      .set('Authorization', `Bearer ${admin}`)
      .send({ tag: 'e2e-tag' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.tag).toBe('e2e-tag');
    // Les champs non envoyés doivent être conservés (update partiel).
    expect(updateRes.body.titre).toBe(`${TEST_PREFIX}-fournisseurs`);
  });

  it('marquer une ressource comme vue met à jour la progression de me', async () => {
    const admin = adminToken();
    const createRes = await request(app.getHttpServer())
      .post('/education')
      .set('Authorization', `Bearer ${admin}`)
      .send({ titre: `${TEST_PREFIX}-vue`, description: 'x', url_contenu: 'https://x.test' });
    const resourceId = createRes.body.id as string;
    createdIds.push(resourceId);

    const client = clientToken();
    const viewRes = await request(app.getHttpServer()).post(`/education/${resourceId}/view`).set('Authorization', `Bearer ${client}`);
    expect(viewRes.status).toBe(201);
    expect(viewRes.body.statut).toBe('vu');

    const progressRes = await request(app.getHttpServer()).get('/education/progress/me').set('Authorization', `Bearer ${client}`);
    expect(progressRes.body.some((p: { resource_id: string }) => p.resource_id === resourceId)).toBe(true);
  });

  it('cycle quiz complet : création, tentative apprenant sans les réponses, soumission, score', async () => {
    const admin = adminToken();
    const createRes = await request(app.getHttpServer())
      .post('/education')
      .set('Authorization', `Bearer ${admin}`)
      .send({ titre: `${TEST_PREFIX}-quiz`, description: 'x', url_contenu: 'https://x.test' });
    const resourceId = createRes.body.id as string;
    createdIds.push(resourceId);

    const badQuiz = await request(app.getHttpServer())
      .put(`/education/${resourceId}/quiz`)
      .set('Authorization', `Bearer ${admin}`)
      .send({ questions: [{ question: 'Q1', options: ['a', 'b'], correct_index: 9 }] });
    expect(badQuiz.status).toBe(400);

    const upsertRes = await request(app.getHttpServer())
      .put(`/education/${resourceId}/quiz`)
      .set('Authorization', `Bearer ${admin}`)
      .send({
        questions: [
          { question: 'Q1', options: ['a', 'b'], correct_index: 0 },
          { question: 'Q2', options: ['a', 'b'], correct_index: 1 },
        ],
        passing_score: 50,
      });
    expect(upsertRes.status).toBe(200);

    const client = clientToken();
    const learnerQuiz = await request(app.getHttpServer()).get(`/education/${resourceId}/quiz`).set('Authorization', `Bearer ${client}`);
    expect(learnerQuiz.status).toBe(200);
    expect(learnerQuiz.body.questions[0].correct_index).toBeUndefined();

    const submitRes = await request(app.getHttpServer())
      .post(`/education/${resourceId}/quiz/submit`)
      .set('Authorization', `Bearer ${client}`)
      .send({ reponses: [0, 1] });
    expect(submitRes.status).toBe(201);
    expect(submitRes.body.score).toBe(100);
    expect(submitRes.body.passed).toBe(true);

    const adminQuiz = await request(app.getHttpServer()).get(`/education/${resourceId}/quiz/admin`).set('Authorization', `Bearer ${admin}`);
    expect(adminQuiz.body.questions[0].correct_index).toBe(0);
  });

  it('DELETE supprime la ressource (cascade quiz+progression en base) ; GET quiz -> 404 ensuite', async () => {
    const admin = adminToken();
    const createRes = await request(app.getHttpServer())
      .post('/education')
      .set('Authorization', `Bearer ${admin}`)
      .send({ titre: `${TEST_PREFIX}-delete`, description: 'x', url_contenu: 'https://x.test' });
    const resourceId = createRes.body.id as string;

    await request(app.getHttpServer())
      .put(`/education/${resourceId}/quiz`)
      .set('Authorization', `Bearer ${admin}`)
      .send({ questions: [{ question: 'Q', options: ['a', 'b'], correct_index: 0 }] });

    const deleteRes = await request(app.getHttpServer())
      .delete(`/education/${resourceId}`)
      .set('Authorization', `Bearer ${admin}`)
      .send({ confirmation_nom: `${TEST_PREFIX}-delete` });
    expect(deleteRes.status).toBe(200);

    const quizAfterDelete = await request(app.getHttpServer()).get(`/education/${resourceId}/quiz`).set('Authorization', `Bearer ${admin}`);
    expect(quizAfterDelete.status).toBe(404);
  });
});
