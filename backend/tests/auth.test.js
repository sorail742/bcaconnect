process.env.REDIS_URL = '';
jest.mock('uuid', () => ({ v4: () => 'mock-uuid-v4' }));
const request = require('supertest');
const app = require('../src/app');
const { User, sequelize } = require('../src/models');
const tokenService = require('../src/services/tokenService');

describe('🛡️ Suite de Tests de Sécurité - Authentification (V2.6)', () => {
    jest.setTimeout(30000); // 30 secondes pour SQLite sync complexes
    
    beforeAll(async () => {
        // Synchroniser la base de données de test (instancie SQLite en mémoire si possible)
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    const mockUser = {
        nom_complet: 'Test Security User',
        email: 'security-test@bca.gn',
        telephone: '1234567890',
        mot_de_passe: 'Password123!',
        role: 'admin'
    };

    describe('POST /api/auth/register', () => {
        it('doit bloquer une inscription avec un mot de passe trop simple (P0 #3)', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...mockUser, mot_de_passe: '123' });
            
            expect(res.status).toBe(422);
            expect(res.body.message).toContain('Données invalides');
        });

        it('doit réussir une inscription valide', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(mockUser);
            
            expect(res.status).toBe(201);
            expect(res.body.user.email).toBeUndefined(); // Sécurité : ne pas renvoyer l'email si non demandé
        });
    });

    describe('POST /api/auth/login', () => {
        it('doit échouer avec de mauvais identifiants', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: mockUser.email, mot_de_passe: 'WrongPass' });
            
            expect(res.status).toBe(401);
        });

        it('doit réussir la connexion et renvoyer un token JWT', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: mockUser.email, mot_de_passe: mockUser.mot_de_passe });
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
        });
    });

    describe('🛡️ Test Chiffrement AES (P0 #5)', () => {
        it('doit chiffrer le numéro de téléphone en base de données via les hooks', async () => {
            console.log('   DEBUG: ENCRYPTION_KEY length =', process.env.ENCRYPTION_KEY?.length);
            
            const directUser = await User.create({
                nom_complet: 'Direct Hook Test',
                email: 'hook@test.gn',
                telephone: '999888777',
                mot_de_passe: 'Hash123!'
            });

            // On vérifie le contenu BRUT en base via une requête SQL brute pour bypasser TOUT hook Sequelize
            const [results] = await sequelize.query(`SELECT telephone FROM utilisateurs WHERE email = 'hook@test.gn'`);
            const rawPhone = results[0].telephone;

            expect(rawPhone).toContain(':'); // Format iv:tag:encryptedData
            expect(directUser.telephone).toBe('999888777'); // Le hook afterFind doit l'avoir déchiffré pour l'instance
        });
    });

    describe('🛡️ Test Algorithme JWT (RS256/HS256)', () => {
        it('doit utiliser un algorithme de signature valide', async () => {
             const res = await request(app)
                .post('/api/auth/login')
                .send({ email: mockUser.email, mot_de_passe: mockUser.mot_de_passe });
            
            const token = res.body.accessToken;
            const decoded = tokenService.verifyAccessToken(token);
            
            expect(decoded.id).toBeDefined();
        });
    });

});
