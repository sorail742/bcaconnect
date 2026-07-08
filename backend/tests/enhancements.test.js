process.env.REDIS_URL = "";
jest.mock("uuid", () => ({ v4: () => "mock-uuid-enh" }));
const request = require("supertest");
const app = require("../src/app");
const { sequelize } = require("../src/models");
const shippingService = require("../src/services/shippingService");

describe("🚚 Optimisation d'itinéraires (Phase 2.7)", () => {
  it("ordonne les arrêts par plus proche voisin et calcule distance/durée", () => {
    const stops = [
      { id: "a", label: "Ratoma", lat: 9.596, lng: -13.646 },
      { id: "b", label: "Kaloum", lat: 9.509, lng: -13.712 },
      { id: "c", label: "Matoto", lat: 9.585, lng: -13.61 },
    ];
    const route = shippingService.optimizeRoute(stops, shippingService.DEPOT_CONAKRY);

    expect(route.ordered).toHaveLength(3);
    expect(route.ordered[0].ordre).toBe(1);
    // Depuis le dépôt (Kaloum), le 1er arrêt visité doit être Kaloum (distance ~0)
    expect(route.ordered[0].label).toBe("Kaloum");
    expect(route.total_distance_km).toBeGreaterThan(0);
    expect(route.total_duration_min).toBeGreaterThan(0);
    expect(route.legs).toHaveLength(3);
  });

  it("géocode une adresse texte vers un centroïde de commune", () => {
    const geo = shippingService.geocodeAddress("Livraison quartier Dixinn Port");
    expect(geo).not.toBeNull();
    expect(geo.commune).toBe("dixinn");
    expect(typeof geo.lat).toBe("number");
  });

  it("retourne null pour une adresse non reconnue", () => {
    expect(shippingService.geocodeAddress("Ville inconnue XYZ")).toBeNull();
  });

  it("gère une liste vide sans erreur", () => {
    const route = shippingService.optimizeRoute([]);
    expect(route.ordered).toHaveLength(0);
    expect(route.total_distance_km).toBe(0);
  });
});

describe("📴 Auth hors ligne — PIN (Phase 3.7)", () => {
  jest.setTimeout(30000);
  let token;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await request(app).post("/api/auth/register").send({
      nom_complet: "Pin User",
      email: "pin-user@bca.gn",
      telephone: "6011223344",
      mot_de_passe: "SecurePass123",
      role: "client",
    });
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "pin-user@bca.gn", mot_de_passe: "SecurePass123" });
    token = login.body.accessToken;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("refuse un PIN non conforme (moins de 4 chiffres)", async () => {
    const res = await request(app)
      .post("/api/auth/offline-pin/set")
      .set("Authorization", `Bearer ${token}`)
      .send({ pin: "12" });
    expect(res.status).toBe(400);
  });

  it("définit un PIN valide", async () => {
    const res = await request(app)
      .post("/api/auth/offline-pin/set")
      .set("Authorization", `Bearer ${token}`)
      .send({ pin: "4821" });
    expect(res.status).toBe(200);
    expect(res.body.pin_defini).toBe(true);
  });

  it("vérifie le bon PIN", async () => {
    const res = await request(app)
      .post("/api/auth/offline-pin/verify")
      .set("Authorization", `Bearer ${token}`)
      .send({ pin: "4821" });
    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(true);
  });

  it("rejette un mauvais PIN", async () => {
    const res = await request(app)
      .post("/api/auth/offline-pin/verify")
      .set("Authorization", `Bearer ${token}`)
      .send({ pin: "0000" });
    expect(res.status).toBe(401);
  });

  it("expose le hash pour cache PWA (jamais le PIN en clair)", async () => {
    const res = await request(app)
      .get("/api/auth/offline-credentials")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.pin_defini).toBe(true);
    expect(res.body.pin_hash).toBeTruthy();
    expect(res.body.pin_hash).not.toBe("4821"); // haché, jamais en clair
  });
});
