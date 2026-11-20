-- produits / commandes / details_commandes : possédées par Sequelize (voir
-- schema.prisma pour le détail des colonnes non modélisées ici). Comme pour
-- 2b_stub_utilisateurs_for_ci, ces tables minimales ne servent qu'aux
-- environnements Prisma neufs (CI) — sur la base partagée les vraies tables
-- Sequelize existent déjà (beaucoup plus de colonnes), donc IF NOT EXISTS
-- ne fait rien là-bas (baselinée via migrate resolve --applied, jamais
-- exécutée pour de vrai contre la base partagée).
CREATE TABLE IF NOT EXISTS "produits" (
  "id" UUID PRIMARY KEY,
  "nom_produit" VARCHAR(150) NOT NULL,
  "prix_unitaire" NUMERIC(15,2) NOT NULL,
  "categorie_id" UUID REFERENCES "categories"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "commandes" (
  "id" UUID PRIMARY KEY,
  "total_ttc" NUMERIC(15,2) NOT NULL,
  "statut" VARCHAR(32),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "details_commandes" (
  "id" UUID PRIMARY KEY,
  "quantite" INTEGER NOT NULL,
  "prix_unitaire_achat" NUMERIC(15,2) NOT NULL,
  "commande_id" UUID REFERENCES "commandes"("id") ON DELETE SET NULL,
  "produit_id" UUID REFERENCES "produits"("id") ON DELETE SET NULL,
  "escrow_released" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
