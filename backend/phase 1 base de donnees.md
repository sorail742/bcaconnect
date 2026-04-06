-- ==========================================================
-- ARCHITECTURE BASE DE DONNÉES BCA CONNECT - PHASE 1
-- Sécurité : UUID | Intégrité : Split Payment & Séquestre
-- ==========================================================

-- 1. EXTENSION (À exécuter si vous avez les droits superuser)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLE DES UTILISATEURS
-- Gère l'identité, les rôles et le score de confiance (Défense IA)
CREATE TABLE utilisateurs (
    id UUID PRIMARY KEY, 
    nom_complet VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telephone VARCHAR(20) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'fournisseur', 'transporteur', 'client', 'banque')),
    score_confiance INT DEFAULT 100,
    est_approuve BOOLEAN DEFAULT FALSE,
    statut VARCHAR(20) DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLE DES PORTEFEUILLES
-- Gère le solde disponible et le solde bloqué (Séquestre)
CREATE TABLE portefeuilles (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES utilisateurs(id) ON DELETE CASCADE,
    solde_virtuel DECIMAL(15, 2) DEFAULT 0.00,
    solde_sequestre DECIMAL(15, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLE DES CATEGORIES
-- Organisation du catalogue pour la recherche
CREATE TABLE categories (
    id UUID PRIMARY KEY,
    nom_categorie VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLE DES BOUTIQUES
-- Espace dédié aux fournisseurs
CREATE TABLE boutiques (
    id UUID PRIMARY KEY,
    proprietaire_id UUID UNIQUE REFERENCES utilisateurs(id) ON DELETE CASCADE,
    nom_boutique VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(150) UNIQUE,
    statut VARCHAR(20) DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLE DES PRODUITS
-- Supporte les préférences IA pour le matchmaking futur
CREATE TABLE produits (
    id UUID PRIMARY KEY,
    boutique_id UUID REFERENCES boutiques(id) ON DELETE CASCADE,
    categorie_id UUID REFERENCES categories(id),
    nom_produit VARCHAR(150) NOT NULL,
    description TEXT,
    prix_unitaire DECIMAL(15, 2) NOT NULL,
    stock_quantite INT DEFAULT 0,
    preferences_ia JSONB, -- Stockage flexible pour l'algorithme IA
    est_local BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLE DES COMMANDES
-- Enveloppe de transaction avec indicateur de résilience
CREATE TABLE commandes (
    id UUID PRIMARY KEY,
    utilisateur_id UUID REFERENCES utilisateurs(id),
    total_ttc DECIMAL(15, 2) NOT NULL,
    statut VARCHAR(30) DEFAULT 'en_attente', -- en_attente, payé, livré, terminé
    mode_resilience BOOLEAN DEFAULT FALSE, -- Identifie les commandes passées hors-ligne
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLE DES DETAILS DE COMMANDES
-- Gère le Split Payment : chaque ligne pointe vers son fournisseur
CREATE TABLE details_commandes (
    id UUID PRIMARY KEY,
    commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE,
    produit_id UUID REFERENCES produits(id),
    fournisseur_id UUID REFERENCES utilisateurs(id),
    quantite INT NOT NULL,
    prix_unitaire_achat DECIMAL(15, 2) NOT NULL
);

-- 9. TABLE DES TRANSACTIONS
-- Journal immuable pour l'audit financier (Preuve de paiement)
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    portefeuille_id UUID REFERENCES portefeuilles(id),
    commande_id UUID REFERENCES commandes(id),
    montant DECIMAL(15, 2) NOT NULL,
    type_transaction VARCHAR(50), -- dépôt, achat, commission, retrait
    reference_externe VARCHAR(100), -- ID Cinetpay / Mobile Money
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABLE DES VERIFICATIONS OTP
-- Sécurité des accès et validation des actions critiques
CREATE TABLE verifications_otp (
    id UUID PRIMARY KEY,
    telephone VARCHAR(20) NOT NULL,
    code VARCHAR(10) NOT NULL,
    type_action VARCHAR(50), -- inscription, paiement, retrait
    expire_at TIMESTAMP NOT NULL,
    est_utilise BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);