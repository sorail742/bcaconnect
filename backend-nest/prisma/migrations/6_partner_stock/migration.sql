-- boutiques : stand-in minimal pour les environnements Prisma neufs (CI) —
-- même principe que 2b_stub_utilisateurs_for_ci / 4_price_index_stub_tables.
-- Sur la base partagée, Sequelize a déjà créé la vraie table (20+ colonnes) :
-- IF NOT EXISTS ne fait rien là-bas (migration baselinée, jamais exécutée
-- pour de vrai).
CREATE TABLE IF NOT EXISTS "boutiques" (
  "id" UUID PRIMARY KEY,
  "nom_boutique" VARCHAR(100) NOT NULL,
  "proprietaire_id" UUID REFERENCES "utilisateurs"("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- produits.boutique_id existe déjà sur la base partagée (créé par Sequelize)
-- mais pas dans le stub CI de la migration 4_price_index_stub_tables
-- (colonne non nécessaire à Price-Index) — ajoutée ici pour partner-stock
-- (vérification de propriété du produit, assertOwnsProduct).
ALTER TABLE "produits" ADD COLUMN IF NOT EXISTS "boutique_id" UUID REFERENCES "boutiques"("id");
ALTER TABLE "produits" ADD COLUMN IF NOT EXISTS "stock_quantite" INTEGER DEFAULT 0;

CREATE TYPE "enum_stocks_partenaires_type_stock" AS ENUM ('consigne', 'entrepot_tiers', 'dropshipping');

-- Table déjà créée par Sequelize sur la base partagée (colonnes/contrainte
-- vérifiées via information_schema.columns + pg_constraint avant d'écrire ce
-- fichier) — cette migration sert de source de vérité pour les
-- environnements Prisma neufs (CI) ; baselinée (migrate resolve --applied)
-- sur la base partagée, jamais exécutée là-bas.
CREATE TABLE "stocks_partenaires" (
  "id" UUID NOT NULL PRIMARY KEY,
  "produit_id" UUID NOT NULL REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "partenaire_nom" VARCHAR(150) NOT NULL,
  "partenaire_contact" VARCHAR(150),
  "type_stock" "enum_stocks_partenaires_type_stock" NOT NULL DEFAULT 'entrepot_tiers',
  "quantite" INTEGER NOT NULL DEFAULT 0,
  "localisation" VARCHAR(200),
  "notes" TEXT,
  "derniere_synchro" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);
