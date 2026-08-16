import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { generateKeyPairSync, randomUUID } from 'crypto';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

// Titre distinctif pour retrouver / nettoyer sans ambiguïté les webinaires
// créés par ce fichier, même en cas d'échec en cours de route (afterAll).
const TEST_TITLE_PREFIX = '[e2e-webinar-test]';

describe('WebinarController (e2e)', () => {
  let app: INestApplication<App>;
  let signToken: (payload: Record<string, unknown>) => string;
  const createdIds: string[] = [];

  beforeAll(async () => {
    // Paire RS256 éphémère générée pour ce run de test uniquement — même
    // principe que .github/workflows/e2e.yml pour Express (openssl genrsa).
    // dotenv ne réécrit jamais une variable déjà présente dans process.env :
    // positionner JWT_PUBLIC_KEY ICI, avant que ConfigModule ne charge .env
    // pendant .compile(), garantit que c'est CETTE clé qui sera utilisée.
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
    // Filet de sécurité : nettoie tout webinaire de ce fichier resté en base
    // si un test a échoué avant son propre appel DELETE.
    const admin = signToken({ id: randomUUID(), email: 'cleanup@bca.gn', role: 'admin', nom_complet: 'Cleanup' });
    for (const id of createdIds) {
      await request(app.getHttpServer()).delete(`/webinars/${id}`).set('Authorization', `Bearer ${admin}`).catch(() => {});
    }
    await app.close();
  });

  const adminToken = () => signToken({ id: randomUUID(), email: 'admin-e2e@bca.gn', role: 'admin', nom_complet: 'Admin E2E' });
  const clientToken = () => signToken({ id: randomUUID(), email: 'client-e2e@bca.gn', role: 'client', nom_complet: 'Client E2E' });

  it('GET /webinars sans jeton -> 401', () => {
    return request(app.getHttpServer()).get('/webinars').expect(401);
  });

  it('GET /webinars avec un jeton valide (non-admin) -> 200, liste', async () => {
    const res = await request(app.getHttpServer()).get('/webinars').set('Authorization', `Bearer ${clientToken()}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /webinars en tant que client (sans manage_content) -> 403', () => {
    return request(app.getHttpServer())
      .post('/webinars')
      .set('Authorization', `Bearer ${clientToken()}`)
      .send({ titre: `${TEST_TITLE_PREFIX} refusé`, description: 'x', date_heure: '2026-09-01T10:00:00.000Z', intervenant: 'x' })
      .expect(403);
  });

  it("cycle complet CRUD en tant qu'admin (create -> get -> update en_direct -> delete)", async () => {
    const admin = adminToken();

    const createRes = await request(app.getHttpServer())
      .post('/webinars')
      .set('Authorization', `Bearer ${admin}`)
      .send({
        titre: `${TEST_TITLE_PREFIX} cycle complet`,
        description: 'Vérification e2e du module pilote NestJS',
        date_heure: '2026-09-01T10:00:00.000Z',
        intervenant: 'Suite e2e',
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body.statut).toBe('a_venir');
    const id = createRes.body.id as string;
    createdIds.push(id);

    const getRes = await request(app.getHttpServer()).get(`/webinars/${id}`).set('Authorization', `Bearer ${admin}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.titre).toBe(`${TEST_TITLE_PREFIX} cycle complet`);

    // Transition vers "en_direct" — le pont interne (Socket.IO) est appelé,
    // et échoue silencieusement si Express n'est pas démarré dans cet
    // environnement de test (comportement voulu, voir InternalBridgeService).
    const liveRes = await request(app.getHttpServer())
      .put(`/webinars/${id}`)
      .set('Authorization', `Bearer ${admin}`)
      .send({ statut: 'en_direct' });
    expect(liveRes.status).toBe(200);
    expect(liveRes.body.statut).toBe('en_direct');

    const deleteRes = await request(app.getHttpServer()).delete(`/webinars/${id}`).set('Authorization', `Bearer ${admin}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe('Webinaire supprimé avec succès.');
    createdIds.splice(createdIds.indexOf(id), 1);

    const goneRes = await request(app.getHttpServer()).get(`/webinars/${id}`).set('Authorization', `Bearer ${admin}`);
    expect(goneRes.status).toBe(404);
  });

  it('GET /webinars/:id pour un id inexistant -> 404', () => {
    return request(app.getHttpServer())
      .get(`/webinars/${randomUUID()}`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(404);
  });

  it('POST /webinars avec un champ non déclaré -> 400 (whitelist/forbidNonWhitelisted)', () => {
    return request(app.getHttpServer())
      .post('/webinars')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({
        titre: `${TEST_TITLE_PREFIX} champ interdit`,
        description: 'x',
        date_heure: '2026-09-01T10:00:00.000Z',
        intervenant: 'x',
        champ_non_prevu: 'valeur',
      })
      .expect(400);
  });
});
