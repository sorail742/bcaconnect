-- produits.prix_unitaire existe déjà sur la base partagée (créée par
-- Sequelize) mais pas dans le stub CI de 4_price_index_stub_tables (colonne
-- non nécessaire à Price-Index) — ajoutée ici pour alert-threshold
-- (listMine affiche le prix courant du produit surveillé).
ALTER TABLE "produits" ADD COLUMN IF NOT EXISTS "prix_unitaire" NUMERIC(15,2);

-- Table déjà créée par Sequelize sur la base partagée (migration
-- 20260814_alert_thresholds.js — colonnes/contraintes vérifiées via
-- information_schema.columns + pg_constraint avant d'écrire ce fichier) —
-- ce stand-in minimal sert de source de vérité pour les environnements
-- Prisma neufs (CI) ; baselinée (migrate resolve --applied) sur la base
-- partagée, jamais exécutée là-bas. Reste écrite par Sequelize après le
-- cutover (voir schema.prisma) : alertThresholdCron.js garde un accès
-- direct à cette table.
CREATE TABLE IF NOT EXISTS "seuils_alerte" (
  "id" UUID NOT NULL PRIMARY KEY,
  "utilisateur_id" UUID NOT NULL REFERENCES "utilisateurs"("id"),
  "produit_id" UUID NOT NULL REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "type" VARCHAR(20) NOT NULL,
  "operateur" VARCHAR(20) NOT NULL DEFAULT 'inferieur_egal',
  "valeur_seuil" NUMERIC(15,2) NOT NULL,
  "actif" BOOLEAN NOT NULL DEFAULT true,
  "dernier_declenchement" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "seuils_alerte_user_produit_type_unique" UNIQUE ("utilisateur_id", "produit_id", "type")
);
