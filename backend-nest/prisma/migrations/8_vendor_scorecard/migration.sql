-- boutiques.created_at/utilisateurs.role existent déjà (stubs des migrations
-- 6_partner_stock / 2b_stub_utilisateurs_for_ci) — seule temps_reponse
-- manque, colonne texte d'affichage jamais alimentée par une vraie durée
-- (voir schema.prisma pour le détail).
ALTER TABLE "boutiques" ADD COLUMN IF NOT EXISTS "temps_reponse" VARCHAR(50) DEFAULT '< 2h';

-- details_commandes.statut existe déjà sur la base partagée (créée par
-- Sequelize) mais pas dans le stub CI de 4_price_index_stub_tables (colonne
-- non nécessaire à Price-Index) — ajoutée ici pour vendor-scorecard (exclut
-- les articles annulés du volume de référence).
ALTER TABLE "details_commandes" ADD COLUMN IF NOT EXISTS "statut" VARCHAR(32) DEFAULT 'en_attente';

-- litiges / reviews : déjà créées par Sequelize sur la base partagée
-- (colonnes/contraintes vérifiées via information_schema.columns +
-- pg_constraint avant d'écrire ce fichier) — ces stands-in minimaux servent
-- de source de vérité pour les environnements Prisma neufs (CI) ; baselinées
-- (migrate resolve --applied) sur la base partagée, jamais exécutées là-bas.
CREATE TABLE IF NOT EXISTS "litiges" (
  "id" UUID NOT NULL PRIMARY KEY,
  "commande_id" UUID NOT NULL REFERENCES "commandes"("id"),
  "defenseur_id" UUID NOT NULL REFERENCES "utilisateurs"("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "reviews" (
  "id" UUID NOT NULL PRIMARY KEY,
  "note" INTEGER NOT NULL,
  "produit_id" UUID REFERENCES "produits"("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
