#!/usr/bin/env node
/**
 * Test Suite: Global DTO Validation
 * Tests all validation scenarios and security features
 */

const axios = require("axios");
const https = require("https");

const API_URL = process.env.API_URL || "http://localhost:5000/api";

// Disable SSL verification for self-signed certs
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const client = axios.create({
  baseURL: API_URL,
  httpsAgent,
  validateStatus: () => true, // Don't throw on any status
});

let testsPassed = 0;
let testsFailed = 0;

// Helper function to run tests
async function runTest(name, testFn) {
  try {
    await testFn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   Error: ${error.message}`);
    testsFailed++;
  }
}

// Test 1: Valid Registration
async function testValidRegistration() {
  const response = await client.post("/auth/register", {
    nom_complet: "John Doe",
    email: `test-${Date.now()}@example.com`,
    telephone: "224612345678",
    mot_de_passe: "SecurePass123",
    role: "client",
  });

  if (response.status !== 201 && response.status !== 400) {
    throw new Error(`Expected 201 or 400, got ${response.status}`);
  }
}

// Test 2: Invalid Email
async function testInvalidEmail() {
  const response = await client.post("/auth/register", {
    nom_complet: "John Doe",
    email: "invalid-email",
    telephone: "224612345678",
    mot_de_passe: "SecurePass123",
    role: "client",
  });

  if (response.status !== 422) {
    throw new Error(`Expected 422, got ${response.status}`);
  }

  if (
    !response.data.errors ||
    !response.data.errors.some((e) => e.field === "email")
  ) {
    throw new Error("Email validation error not found");
  }
}

// Test 3: Short Password
async function testShortPassword() {
  const response = await client.post("/auth/register", {
    nom_complet: "John Doe",
    email: `test-${Date.now()}@example.com`,
    telephone: "224612345678",
    mot_de_passe: "weak",
    role: "client",
  });

  if (response.status !== 422) {
    throw new Error(`Expected 422, got ${response.status}`);
  }

  if (
    !response.data.errors ||
    !response.data.errors.some((e) => e.field === "mot_de_passe")
  ) {
    throw new Error("Password validation error not found");
  }
}

// Test 4: Invalid Role
async function testInvalidRole() {
  const response = await client.post("/auth/register", {
    nom_complet: "John Doe",
    email: `test-${Date.now()}@example.com`,
    telephone: "224612345678",
    mot_de_passe: "SecurePass123",
    role: "invalid_role",
  });

  if (response.status !== 422) {
    throw new Error(`Expected 422, got ${response.status}`);
  }

  if (
    !response.data.errors ||
    !response.data.errors.some((e) => e.field === "role")
  ) {
    throw new Error("Role validation error not found");
  }
}

async function testTechnicienMissingFields() {
  const response = await client.post("/auth/register", {
    nom_complet: "Technicien Test",
    email: `tech-${Date.now()}@example.com`,
    telephone: "224612345679",
    mot_de_passe: "SecurePass123",
    role: "technicien",
  });

  if (response.status !== 422 && response.status !== 400) {
    throw new Error(`Expected 422 or 400, got ${response.status}`);
  }

  if (response.status === 422) {
    if (
      !response.data.errors ||
      (!response.data.errors.some((e) => e.field === "specialites") &&
        !response.data.errors.some((e) => e.field === "zone_intervention"))
    ) {
      throw new Error("Technicien missing field validation error not found");
    }
  }
}

async function testTechnicienValidRegistration() {
  const response = await client.post("/auth/register", {
    nom_complet: "Technicien Valide",
    email: `tech-valide-${Date.now()}@example.com`,
    telephone: "224612345680",
    mot_de_passe: "SecurePass123",
    role: "technicien",
    specialites: "Plomberie, Électricité",
    zone_intervention: "Conakry",
  });

  if (
    response.status !== 201 &&
    response.status !== 400 &&
    response.status !== 401
  ) {
    throw new Error(`Expected 201 or 400/401, got ${response.status}`);
  }
}

// Test 5: Short Name
async function testShortName() {
  const response = await client.post("/auth/register", {
    nom_complet: "J",
    email: `test-${Date.now()}@example.com`,
    telephone: "224612345678",
    mot_de_passe: "SecurePass123",
    role: "client",
  });

  if (response.status !== 422) {
    throw new Error(`Expected 422, got ${response.status}`);
  }

  if (
    !response.data.errors ||
    !response.data.errors.some((e) => e.field === "nom_complet")
  ) {
    throw new Error("Name validation error not found");
  }
}

// Test 6: Invalid Telephone
async function testInvalidTelephone() {
  const response = await client.post("/auth/register", {
    nom_complet: "John Doe",
    email: `test-${Date.now()}@example.com`,
    telephone: "123",
    mot_de_passe: "SecurePass123",
    role: "client",
  });

  if (response.status !== 422) {
    throw new Error(`Expected 422, got ${response.status}`);
  }

  if (
    !response.data.errors ||
    !response.data.errors.some((e) => e.field === "telephone")
  ) {
    throw new Error("Telephone validation error not found");
  }
}

// Test 7: XSS Protection
async function testXSSProtection() {
  const response = await client.post("/auth/register", {
    nom_complet: '<script>alert("XSS")</script>',
    email: `test-${Date.now()}@example.com`,
    telephone: "224612345678",
    mot_de_passe: "SecurePass123",
    role: "client",
  });

  // Should either reject or sanitize
  if (response.status === 422) {
    // Validation rejected it
    return;
  }

  // If accepted, check that script tags are removed
  if (response.data.user && response.data.user.nom_complet) {
    if (response.data.user.nom_complet.includes("<script>")) {
      throw new Error("XSS not sanitized");
    }
  }
}

// Test 8: Missing Required Field
async function testMissingRequiredField() {
  const response = await client.post("/auth/register", {
    nom_complet: "John Doe",
    // email missing
    telephone: "224612345678",
    mot_de_passe: "SecurePass123",
    role: "client",
  });

  if (response.status !== 422) {
    throw new Error(`Expected 422, got ${response.status}`);
  }

  if (
    !response.data.errors ||
    !response.data.errors.some((e) => e.field === "email")
  ) {
    throw new Error("Email required validation error not found");
  }
}

// Test 9: Invalid Content-Type
async function testInvalidContentType() {
  const response = await client.post("/auth/register", "invalid data", {
    headers: {
      "Content-Type": "text/plain",
    },
  });

  if (response.status !== 415 && response.status !== 400) {
    throw new Error(`Expected 415 or 400, got ${response.status}`);
  }
}

// Test 10: Valid Login
async function testValidLogin() {
  const response = await client.post("/auth/login", {
    email: "test@example.com",
    mot_de_passe: "password123",
  });

  // Should return 401 (invalid credentials) or 200 (success)
  // Not 422 (validation error)
  if (response.status === 422) {
    throw new Error("Login validation failed");
  }
}

// Test 11: Invalid Login Email
async function testInvalidLoginEmail() {
  const response = await client.post("/auth/login", {
    email: "invalid-email",
    mot_de_passe: "password123",
  });

  if (response.status !== 422) {
    throw new Error(`Expected 422, got ${response.status}`);
  }

  if (
    !response.data.errors ||
    !response.data.errors.some((e) => e.field === "email")
  ) {
    throw new Error("Email validation error not found");
  }
}

// Test 12: Missing Login Password
async function testMissingLoginPassword() {
  const response = await client.post("/auth/login", {
    email: "test@example.com",
    // password missing
  });

  if (response.status !== 422) {
    throw new Error(`Expected 422, got ${response.status}`);
  }

  if (
    !response.data.errors ||
    !response.data.errors.some((e) => e.field === "mot_de_passe")
  ) {
    throw new Error("Password required validation error not found");
  }
}

// Test 13: Pagination Validation
async function testPaginationValidation() {
  const response = await client.get("/products?page=0&limit=200");

  // Should either reject or adjust values
  if (response.status === 400 || response.status === 422) {
    // Validation rejected it
    return;
  }

  // If accepted, check that values are adjusted
  if (response.data.pagination) {
    if (
      response.data.pagination.page < 1 ||
      response.data.pagination.limit > 100
    ) {
      throw new Error("Pagination not validated");
    }
  }
}

// Test 14: Valid Product Creation (if authenticated)
async function testValidProductCreation() {
  const response = await client.post("/products", {
    nom_produit: "Test Product",
    description: "A test product description",
    prix: 10000.5,
    quantite_stock: 100,
    categorie_id: "550e8400-e29b-41d4-a716-446655440000",
  });

  // Should return 401 (not authenticated) or 201 (created)
  // Not 422 (validation error)
  if (response.status === 422) {
    throw new Error("Product validation failed");
  }
}

// Test 15: Invalid Product Price
async function testInvalidProductPrice() {
  const response = await client.post("/products", {
    nom_produit: "Test Product",
    description: "A test product description",
    prix: -100,
    quantite_stock: 100,
    categorie_id: "550e8400-e29b-41d4-a716-446655440000",
  });

  if (response.status !== 422 && response.status !== 401) {
    throw new Error(`Expected 422 or 401, got ${response.status}`);
  }

  if (response.status === 422) {
    if (
      !response.data.errors ||
      !response.data.errors.some((e) => e.field === "prix")
    ) {
      throw new Error("Price validation error not found");
    }
  }
}

// Test 16: Invalid Product Quantity
async function testInvalidProductQuantity() {
  const response = await client.post("/products", {
    nom_produit: "Test Product",
    description: "A test product description",
    prix: 10000,
    quantite_stock: -50,
    categorie_id: "550e8400-e29b-41d4-a716-446655440000",
  });

  if (response.status !== 422 && response.status !== 401) {
    throw new Error(`Expected 422 or 401, got ${response.status}`);
  }

  if (response.status === 422) {
    if (
      !response.data.errors ||
      !response.data.errors.some((e) => e.field === "quantite_stock")
    ) {
      throw new Error("Quantity validation error not found");
    }
  }
}

// Test 17: Invalid UUID Parameter
async function testInvalidUUIDParameter() {
  const response = await client.get("/products/invalid-uuid");

  if (response.status !== 400 && response.status !== 404) {
    throw new Error(`Expected 400 or 404, got ${response.status}`);
  }
}

// Test 18: Valid UUID Parameter
async function testValidUUIDParameter() {
  const response = await client.get(
    "/products/550e8400-e29b-41d4-a716-446655440000",
  );

  // Should return 404 (not found) or 200 (found)
  // Not 400 (invalid parameter)
  if (response.status === 400) {
    throw new Error("UUID validation failed");
  }
}

// Test 19: Validation Error Format
async function testValidationErrorFormat() {
  const response = await client.post("/auth/register", {
    nom_complet: "J",
    email: "invalid",
    telephone: "123",
    mot_de_passe: "weak",
    role: "invalid",
  });

  if (response.status !== 422) {
    throw new Error(`Expected 422, got ${response.status}`);
  }

  if (
    !response.data.message ||
    !response.data.errors ||
    !Array.isArray(response.data.errors)
  ) {
    throw new Error("Invalid error response format");
  }

  // Check error structure
  const error = response.data.errors[0];
  if (!error.field || !error.message || !error.location) {
    throw new Error("Invalid error object structure");
  }
}

// Test 20: Health Check
async function testHealthCheck() {
  const response = await client.get("/health");

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!response.data.validation) {
    throw new Error("Validation not enabled in health check");
  }
}

// Main test runner
async function runAllTests() {
  console.log("\n🔐 Global DTO Validation Test Suite");
  console.log("═".repeat(50));
  console.log(`API URL: ${API_URL}\n`);

  // Authentication Tests
  console.log("📝 Authentication Tests");
  console.log("─".repeat(50));
  await runTest("Valid Registration", testValidRegistration);
  await runTest("Invalid Email", testInvalidEmail);
  await runTest("Short Password", testShortPassword);
  await runTest("Invalid Role", testInvalidRole);
  await runTest("Technicien Missing Fields", testTechnicienMissingFields);
  await runTest(
    "Technicien Valid Registration",
    testTechnicienValidRegistration,
  );
  await runTest("Short Name", testShortName);
  await runTest("Invalid Telephone", testInvalidTelephone);
  await runTest("XSS Protection", testXSSProtection);
  await runTest("Missing Required Field", testMissingRequiredField);
  await runTest("Invalid Content-Type", testInvalidContentType);
  await runTest("Valid Login", testValidLogin);
  await runTest("Invalid Login Email", testInvalidLoginEmail);
  await runTest("Missing Login Password", testMissingLoginPassword);

  // Product Tests
  console.log("\n📝 Product Tests");
  console.log("─".repeat(50));
  await runTest("Valid Product Creation", testValidProductCreation);
  await runTest("Invalid Product Price", testInvalidProductPrice);
  await runTest("Invalid Product Quantity", testInvalidProductQuantity);

  // Parameter Tests
  console.log("\n📝 Parameter Tests");
  console.log("─".repeat(50));
  await runTest("Invalid UUID Parameter", testInvalidUUIDParameter);
  await runTest("Valid UUID Parameter", testValidUUIDParameter);
  await runTest("Pagination Validation", testPaginationValidation);

  // Error Format Tests
  console.log("\n📝 Error Format Tests");
  console.log("─".repeat(50));
  await runTest("Validation Error Format", testValidationErrorFormat);

  // Health Check
  console.log("\n📝 Health Check");
  console.log("─".repeat(50));
  await runTest("Health Check", testHealthCheck);

  // Summary
  console.log("\n" + "═".repeat(50));
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📊 Total Tests: ${testsPassed + testsFailed}`);
  console.log(
    `📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%`,
  );
  console.log("═".repeat(50) + "\n");

  if (testsFailed === 0) {
    console.log("🎉 All tests passed!\n");
    process.exit(0);
  } else {
    console.log(`⚠️  ${testsFailed} test(s) failed\n`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
