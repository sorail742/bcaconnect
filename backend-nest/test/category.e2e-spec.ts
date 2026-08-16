import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { generateKeyPairSync, randomUUID } from 'crypto';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

// Préfixe distinctif pour retrouver / nettoyer sans ambiguïté les
// catégories créées par ce fichier, même en cas d'échec en cours de route.
const TEST_PREFIX = `e2e-cat-${Date.now()}`;

describe('CategoryController (e2e)', () => {
  let app: INestApplication<App>;
  let signToken: (payload: Record<string, unknown>) => string;
  const createdIds: string[] = [];

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
  });

  afterAll(async () => {
    const admin = signToken({ id: randomUUID(), email: 'cleanup@bca.gn', role: 'admin', nom_complet: 'Cleanup' });
    // Enfants d'abord (une catégorie parente supprimée en premier orpheline
    // ses enfants plutôt que de les supprimer — il faut nettoyer les deux).
    for (const id of [...createdIds].reverse()) {
      await request(app.getHttpServer()).delete(`/categories/${id}`).set('Authorization', `Bearer ${admin}`).catch(() => {});
    }
    await app.close();
  });

  const adminToken = () => signToken({ id: randomUUID(), email: 'admin-e2e@bca.gn', role: 'admin', nom_complet: 'Admin E2E' });
  const clientToken = () => signToken({ id: randomUUID(), email: 'client-e2e@bca.gn', role: 'client', nom_complet: 'Client E2E' });

  it('GET /categories est public (sans jeton) -> 200, liste', async () => {
    const res = await request(app.getHttpServer()).get('/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /categories sans jeton -> 401', () => {
    return request(app.getHttpServer())
      .post('/categories')
      .send({ nom_categorie: `${TEST_PREFIX}-refuse` })
      .expect(401);
  });

  it('POST /categories en tant que client (sans manage_categories) -> 403', () => {
    return request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${clientToken()}`)
      .send({ nom_categorie: `${TEST_PREFIX}-refuse-403` })
      .expect(403);
  });

  it("cycle complet CRUD en tant qu'admin, avec sous-catégorie imbriquée", async () => {
    const admin = adminToken();

    const rootRes = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${admin}`)
      .send({ nom_categorie: `${TEST_PREFIX}-racine`, description: 'Catégorie racine e2e' });
    expect(rootRes.status).toBe(201);
    expect(rootRes.body.createdAt).toBeDefined();
    const rootId = rootRes.body.id as string;
    createdIds.push(rootId);

    const childRes = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${admin}`)
      .send({ nom_categorie: `${TEST_PREFIX}-enfant`, parent_id: rootId });
    expect(childRes.status).toBe(201);
    const childId = childRes.body.id as string;
    createdIds.push(childId);

    const listRes = await request(app.getHttpServer()).get('/categories');
    const root = listRes.body.find((c: { id: string }) => c.id === rootId);
    expect(root).toBeDefined();
    expect(root.sous_categories.some((c: { id: string }) => c.id === childId)).toBe(true);

    const updateRes = await request(app.getHttpServer())
      .put(`/categories/${rootId}`)
      .set('Authorization', `Bearer ${admin}`)
      .send({ nom_categorie: `${TEST_PREFIX}-racine-renommee` });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.nom_categorie).toBe(`${TEST_PREFIX}-racine-renommee`);

    const deleteRes = await request(app.getHttpServer()).delete(`/categories/${childId}`).set('Authorization', `Bearer ${admin}`);
    expect(deleteRes.status).toBe(200);
    createdIds.splice(createdIds.indexOf(childId), 1);
  });

  it('POST /categories avec un nom déjà utilisé -> 409', async () => {
    const admin = adminToken();
    const nom = `${TEST_PREFIX}-doublon`;

    const first = await request(app.getHttpServer()).post('/categories').set('Authorization', `Bearer ${admin}`).send({ nom_categorie: nom });
    expect(first.status).toBe(201);
    createdIds.push(first.body.id);

    const second = await request(app.getHttpServer()).post('/categories').set('Authorization', `Bearer ${admin}`).send({ nom_categorie: nom });
    expect(second.status).toBe(409);
  });

  it('PUT /categories/:id pour un id inexistant -> 404', () => {
    return request(app.getHttpServer())
      .put(`/categories/${randomUUID()}`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ nom_categorie: `${TEST_PREFIX}-inexistant` })
      .expect(404);
  });

  it('POST /categories avec un parent_id mal formé -> 400', () => {
    return request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ nom_categorie: `${TEST_PREFIX}-parent-invalide`, parent_id: 'pas-un-uuid' })
      .expect(400);
  });
});
