-- commandes.utilisateur_id / details_commandes.fournisseur_id existent déjà
-- sur la base partagée (créées par Sequelize) mais pas dans les stubs CI des
-- migrations 4_price_index_stub_tables — ajoutées ici pour invoice
-- (identification de l'acheteur, filtrage des lignes par vendeur).
ALTER TABLE "commandes" ADD COLUMN IF NOT EXISTS "utilisateur_id" UUID REFERENCES "utilisateurs"("id");
ALTER TABLE "details_commandes" ADD COLUMN IF NOT EXISTS "fournisseur_id" UUID REFERENCES "utilisateurs"("id");

CREATE TABLE "compteurs_facture" (
  "id" SERIAL PRIMARY KEY,
  "dernier_numero" INTEGER NOT NULL DEFAULT 0
);

-- Table déjà créée par Sequelize sur la base partagée (colonnes/contraintes
-- vérifiées via information_schema.columns + pg_constraint avant d'écrire ce
-- fichier) — cette migration sert de source de vérité pour les
-- environnements Prisma neufs (CI) ; baselinée (migrate resolve --applied)
-- sur la base partagée, jamais exécutée là-bas.
CREATE TABLE "factures" (
  "id" UUID NOT NULL PRIMARY KEY,
  "numero" VARCHAR(30) NOT NULL UNIQUE,
  "commande_id" UUID NOT NULL REFERENCES "commandes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "boutique_id" UUID NOT NULL REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "utilisateur_id" UUID NOT NULL REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "acheteur_nif" VARCHAR(50),
  "montant_ht" NUMERIC(15,2) NOT NULL,
  "taux_tva" NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  "montant_tva" NUMERIC(15,2) NOT NULL,
  "montant_ttc" NUMERIC(15,2) NOT NULL,
  "date_emission" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "factures_commande_boutique_unique" UNIQUE ("commande_id", "boutique_id")
);
