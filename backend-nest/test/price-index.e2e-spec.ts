import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { generateKeyPairSync, randomUUID } from 'crypto';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const TEST_PREFIX = `e2e-price-idx-${Date.now()}`;

describe('PriceIndexController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let signToken: (payload: Record<string, unknown>) => string;

  // Price-Index n'a aucune table propre (voir schema.prisma) : il agrège en
  // lecture seule produits/commandes/details_commandes, encore entièrement
  // possédées par Sequelize côté backend/. Aucune route Nest n'existe pour
  // les écrire — on insère donc directement les fixtures via SQL brut,
  // exactement comme educational_progress le fait pour utilisateurs.
  let categorieId: string;
  let produitId: string;
  let commandeValideId: string;
  let commandeExclueId: string;
  let detailValideId: string;
  let detailExcluId: string;

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

    const admin = signToken({ id: randomUUID(), email: 'admin-price-idx@bca.gn', role: 'admin', nom_complet: 'Admin E2E' });
    const catRes = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${admin}`)
      .send({ nom_categorie: `${TEST_PREFIX}-categorie` });
    categorieId = catRes.body.id as string;

    produitId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO produits (id, nom_produit, prix_unitaire, categorie_id, created_at, updated_at)
      VALUES (${produitId}::uuid, ${`${TEST_PREFIX}-produit`}, 100.00, ${categorieId}::uuid, now(), now())
    `;

    commandeValideId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO commandes (id, total_ttc, statut, created_at, updated_at)
      VALUES (${commandeValideId}::uuid, 200.00, ${'livré'}, now(), now())
    `;
    commandeExclueId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO commandes (id, total_ttc, statut, created_at, updated_at)
      VALUES (${commandeExclueId}::uuid, 200.00, ${'annulé'}, now(), now())
    `;

    detailValideId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO details_commandes (id, quantite, prix_unitaire_achat, commande_id, produit_id, created_at, updated_at)
      VALUES (${detailValideId}::uuid, 2, 100.00, ${commandeValideId}::uuid, ${produitId}::uuid, now(), now())
    `;
    detailExcluId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO details_commandes (id, quantite, prix_unitaire_achat, commande_id, produit_id, created_at, updated_at)
      VALUES (${detailExcluId}::uuid, 5, 999.00, ${commandeExclueId}::uuid, ${produitId}::uuid, now(), now())
    `;
  });

  afterAll(async () => {
    await prisma.$executeRaw`DELETE FROM details_commandes WHERE id IN (${detailValideId}::uuid, ${detailExcluId}::uuid)`;
    await prisma.$executeRaw`DELETE FROM commandes WHERE id IN (${commandeValideId}::uuid, ${commandeExclueId}::uuid)`;
    await prisma.$executeRaw`DELETE FROM produits WHERE id = ${produitId}::uuid`;

    const admin = signToken({ id: randomUUID(), email: 'cleanup-price-idx@bca.gn', role: 'admin', nom_complet: 'Cleanup' });
    await request(app.getHttpServer()).delete(`/categories/${categorieId}`).set('Authorization', `Bearer ${admin}`).catch(() => {});
    await app.close();
  });

  it('GET /price-index/category/:id est public (sans jeton) -> 200, agrège uniquement les commandes non exclues', async () => {
    const res = await request(app.getHttpServer()).get(`/price-index/category/${categorieId}`);
    expect(res.status).toBe(200);
    expect(res.body.categorie.id).toBe(categorieId);
    expect(res.body.echantillon_total).toBe(1);

    const currentPeriod = new Date().toISOString().slice(0, 7);
    const point = res.body.points.find((p: { periode: string }) => p.periode === currentPeriod);
    expect(point).toBeDefined();
    expect(point.prix_moyen).toBe(100);
    expect(point.volume_unites).toBe(2);
    expect(point.nombre_commandes).toBe(1);
  });

  it('GET /price-index/product/:id agrège uniquement les commandes non exclues pour ce produit', async () => {
    const res = await request(app.getHttpServer()).get(`/price-index/product/${produitId}`);
    expect(res.status).toBe(200);
    expect(res.body.produit).toEqual({ id: produitId, nom: `${TEST_PREFIX}-produit` });
    expect(res.body.echantillon_total).toBe(1);
  });

  it('GET /price-index/category/:id avec un id de catégorie inexistant -> 404', () => {
    return request(app.getHttpServer()).get(`/price-index/category/${randomUUID()}`).expect(404);
  });

  it('GET /price-index/product/:id avec un id de produit inexistant -> 404', () => {
    return request(app.getHttpServer()).get(`/price-index/product/${randomUUID()}`).expect(404);
  });

  it('GET /price-index/category/:id avec un id mal formé -> 400', () => {
    return request(app.getHttpServer()).get('/price-index/category/pas-un-uuid').expect(400);
  });

  it('GET /price-index/category/:id avec months hors bornes (>24) -> 400', () => {
    return request(app.getHttpServer()).get(`/price-index/category/${categorieId}`).query({ months: 99 }).expect(400);
  });

  it('GET /price-index/category/:id répercute le paramètre months dans la réponse', () => {
    return request(app.getHttpServer())
      .get(`/price-index/category/${categorieId}`)
      .query({ months: 1 })
      .expect(200)
      .then((res) => {
        expect(res.body.periode_mois).toBe(1);
      });
  });
});
