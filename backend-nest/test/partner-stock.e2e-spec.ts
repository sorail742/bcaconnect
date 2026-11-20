import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { generateKeyPairSync, randomUUID } from 'crypto';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const TEST_PREFIX = `e2e-pstock-${Date.now()}`;

describe('PartnerStockController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let signToken: (payload: Record<string, unknown>) => string;
  // produits/boutiques/utilisateurs sont encore possédées par Sequelize —
  // fixtures créées par SQL brut, comme price-index.e2e-spec.ts et
  // certification.e2e-spec.ts.
  let fournisseurId: string;
  let autreFournisseurId: string;
  let boutiqueId: string;
  let produitId: string;
  const createdEntryIds: string[] = [];

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
      VALUES (${fournisseurId}::uuid, ${'E2E PStock Fournisseur'}, ${`${TEST_PREFIX}@bca.gn`}, ${`+224${Date.now()}`}, ${'unused'}, ${'fournisseur'}, now(), now())
    `;
    autreFournisseurId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO utilisateurs (id, nom_complet, email, telephone, mot_de_passe, role, created_at, updated_at)
      VALUES (${autreFournisseurId}::uuid, ${'E2E PStock Autre Fournisseur'}, ${`${TEST_PREFIX}-autre@bca.gn`}, ${`+224${Date.now() + 1}`}, ${'unused'}, ${'fournisseur'}, now(), now())
    `;

    boutiqueId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO boutiques (id, nom_boutique, proprietaire_id, created_at, updated_at)
      VALUES (${boutiqueId}::uuid, ${`${TEST_PREFIX}-boutique`}, ${fournisseurId}::uuid, now(), now())
    `;

    produitId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO produits (id, nom_produit, prix_unitaire, boutique_id, stock_quantite, created_at, updated_at)
      VALUES (${produitId}::uuid, ${`${TEST_PREFIX}-produit`}, 5000, ${boutiqueId}::uuid, 10, now(), now())
    `;
  });

  afterAll(async () => {
    await prisma.$executeRaw`DELETE FROM stocks_partenaires WHERE id = ANY(${createdEntryIds}::uuid[])`;
    await prisma.$executeRaw`DELETE FROM produits WHERE id = ${produitId}::uuid`;
    await prisma.$executeRaw`DELETE FROM boutiques WHERE id = ${boutiqueId}::uuid`;
    await prisma.$executeRaw`DELETE FROM utilisateurs WHERE id = ANY(${[fournisseurId, autreFournisseurId]}::uuid[])`;
    await app.close();
  });

  const fournisseurToken = () => signToken({ id: fournisseurId, email: `${TEST_PREFIX}@bca.gn`, role: 'fournisseur', nom_complet: 'E2E Fournisseur' });
  const autreFournisseurToken = () =>
    signToken({ id: autreFournisseurId, email: `${TEST_PREFIX}-autre@bca.gn`, role: 'fournisseur', nom_complet: 'E2E Autre Fournisseur' });
  const clientToken = () => signToken({ id: randomUUID(), email: 'client-e2e-pstock@bca.gn', role: 'client', nom_complet: 'Client E2E' });

  it('GET sans jeton -> 401 ; en tant que client -> 403', async () => {
    await request(app.getHttpServer()).get(`/partner-stock/product/${produitId}`).expect(401);
    await request(app.getHttpServer()).get(`/partner-stock/product/${produitId}`).set('Authorization', `Bearer ${clientToken()}`).expect(403);
  });

  it('un fournisseur qui ne possède pas le produit reçoit 403', () => {
    return request(app.getHttpServer())
      .get(`/partner-stock/product/${produitId}`)
      .set('Authorization', `Bearer ${autreFournisseurToken()}`)
      .expect(403);
  });

  it('produit inexistant -> 404', () => {
    return request(app.getHttpServer())
      .get(`/partner-stock/product/${randomUUID()}`)
      .set('Authorization', `Bearer ${fournisseurToken()}`)
      .expect(404);
  });

  it("cycle complet : création, liste, stock total, mise à jour, suppression", async () => {
    const token = fournisseurToken();

    const createRes = await request(app.getHttpServer())
      .post(`/partner-stock/product/${produitId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ partenaire_nom: `${TEST_PREFIX}-partenaire`, quantite: 25, type_stock: 'consigne' });
    expect(createRes.status).toBe(201);
    expect(createRes.body.type_stock).toBe('consigne');
    const entryId = createRes.body.id as string;
    createdEntryIds.push(entryId);

    const listRes = await request(app.getHttpServer()).get(`/partner-stock/product/${produitId}`).set('Authorization', `Bearer ${token}`);
    expect(listRes.body.some((e: { id: string }) => e.id === entryId)).toBe(true);

    const totalRes = await request(app.getHttpServer()).get(`/partner-stock/product/${produitId}/total`).set('Authorization', `Bearer ${token}`);
    expect(totalRes.body).toEqual({
      stock_propre: 10,
      stock_partenaires: 25,
      stock_total: 35,
      detail: expect.any(Array),
    });

    const updateRes = await request(app.getHttpServer())
      .put(`/partner-stock/${entryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantite: 40 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.quantite).toBe(40);

    const deleteRes = await request(app.getHttpServer()).delete(`/partner-stock/${entryId}`).set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
    createdEntryIds.splice(createdEntryIds.indexOf(entryId), 1);
  });

  it('POST avec une quantité négative -> 400', () => {
    return request(app.getHttpServer())
      .post(`/partner-stock/product/${produitId}`)
      .set('Authorization', `Bearer ${fournisseurToken()}`)
      .send({ partenaire_nom: `${TEST_PREFIX}-refuse`, quantite: -5 })
      .expect(400);
  });

  it('un admin peut agir sur un produit qui ne lui appartient pas', async () => {
    const admin = signToken({ id: randomUUID(), email: 'admin-e2e-pstock@bca.gn', role: 'admin', nom_complet: 'Admin E2E' });
    const res = await request(app.getHttpServer())
      .post(`/partner-stock/product/${produitId}`)
      .set('Authorization', `Bearer ${admin}`)
      .send({ partenaire_nom: `${TEST_PREFIX}-admin`, quantite: 1 });
    expect(res.status).toBe(201);
    createdEntryIds.push(res.body.id);
  });
});
