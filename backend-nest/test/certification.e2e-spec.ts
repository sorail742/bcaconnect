import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { generateKeyPairSync, randomUUID } from 'crypto';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const TEST_PREFIX = `e2e-cert-${Date.now()}`;

describe('CertificationController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let signToken: (payload: Record<string, unknown>) => string;
  // certifications.fournisseur_id porte une vraie contrainte FK vers
  // utilisateurs (ON DELETE CASCADE, vérifié via pg_constraint) — même
  // raison que education.e2e-spec.ts : on crée un utilisateur jetable réel.
  let fournisseurId: string;
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

    prisma = app.get(PrismaService);
    fournisseurId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO utilisateurs (id, nom_complet, email, telephone, mot_de_passe, role, created_at, updated_at)
      VALUES (${fournisseurId}::uuid, ${'E2E Certification Fournisseur'}, ${`${TEST_PREFIX}@bca.gn`}, ${`+224${Date.now()}`}, ${'unused'}, ${'fournisseur'}, now(), now())
    `;
  });

  afterAll(async () => {
    await prisma.$executeRaw`DELETE FROM certifications WHERE id = ANY(${createdIds}::uuid[])`;
    await prisma.$executeRaw`DELETE FROM utilisateurs WHERE id = ${fournisseurId}::uuid`;
    await app.close();
  });

  const fournisseurToken = () => signToken({ id: fournisseurId, email: `${TEST_PREFIX}@bca.gn`, role: 'fournisseur', nom_complet: 'E2E Fournisseur' });
  const adminToken = () => signToken({ id: randomUUID(), email: 'admin-e2e-cert@bca.gn', role: 'admin', nom_complet: 'Admin E2E' });
  const clientToken = () => signToken({ id: randomUUID(), email: 'client-e2e-cert@bca.gn', role: 'client', nom_complet: 'Client E2E' });

  it('GET /certifications/vendor/:id/status est public (sans jeton) -> 200', async () => {
    const res = await request(app.getHttpServer()).get(`/certifications/vendor/${fournisseurId}/status`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ certified: false, count: 0, niveau_verification: 'non_verifie' });
  });

  it('POST /certifications sans jeton -> 401 ; en tant que client -> 403', async () => {
    await request(app.getHttpServer())
      .post('/certifications')
      .send({ type: `${TEST_PREFIX}-refuse`, document_url: 'https://x.test/doc.pdf' })
      .expect(401);

    await request(app.getHttpServer())
      .post('/certifications')
      .set('Authorization', `Bearer ${clientToken()}`)
      .send({ type: `${TEST_PREFIX}-refuse-403`, document_url: 'https://x.test/doc.pdf' })
      .expect(403);
  });

  it('GET /certifications (liste admin) en tant que fournisseur -> 403', () => {
    return request(app.getHttpServer()).get('/certifications').set('Authorization', `Bearer ${fournisseurToken()}`).expect(403);
  });

  it("cycle complet : soumission fournisseur, revue admin, badge boutique mis à jour", async () => {
    const createRes = await request(app.getHttpServer())
      .post('/certifications')
      .set('Authorization', `Bearer ${fournisseurToken()}`)
      .send({ type: `${TEST_PREFIX}-registre`, document_url: 'https://academy.test/doc.pdf' });
    expect(createRes.status).toBe(201);
    expect(createRes.body.statut).toBe('en_attente');
    const certId = createRes.body.id as string;
    createdIds.push(certId);

    const mineRes = await request(app.getHttpServer()).get('/certifications/mine').set('Authorization', `Bearer ${fournisseurToken()}`);
    expect(mineRes.body.some((c: { id: string }) => c.id === certId)).toBe(true);

    const admin = adminToken();
    const adminListRes = await request(app.getHttpServer()).get('/certifications').set('Authorization', `Bearer ${admin}`).query({ statut: 'en_attente' });
    expect(adminListRes.body.some((c: { id: string }) => c.id === certId)).toBe(true);

    const reviewRes = await request(app.getHttpServer())
      .put(`/certifications/${certId}/review`)
      .set('Authorization', `Bearer ${admin}`)
      .send({ statut: 'validee' });
    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.statut).toBe('validee');
    expect(reviewRes.body.niveau_verification).toBe('verifie');

    const statusRes = await request(app.getHttpServer()).get(`/certifications/vendor/${fournisseurId}/status`);
    expect(statusRes.body).toEqual({ certified: true, count: 1, niveau_verification: 'verifie' });
  });

  it('PUT /certifications/:id/review avec un statut invalide -> 400', () => {
    return request(app.getHttpServer())
      .put(`/certifications/${randomUUID()}/review`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ statut: 'en_attente' })
      .expect(400);
  });

  it('PUT /certifications/:id/review pour un id inexistant -> 404', () => {
    return request(app.getHttpServer())
      .put(`/certifications/${randomUUID()}/review`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ statut: 'rejetee' })
      .expect(404);
  });
});
