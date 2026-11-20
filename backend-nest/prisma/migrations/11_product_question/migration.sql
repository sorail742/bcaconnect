-- produits.image_url existe déjà sur la base partagée (créée par Sequelize)
-- mais pas dans le stub CI de 4_price_index_stub_tables — ajoutée ici pour
-- product-question (vignette des questions en attente côté vendeur).
ALTER TABLE "produits" ADD COLUMN IF NOT EXISTS "image_url" TEXT;

-- Table déjà créée par Sequelize sur la base partagée (colonnes/contraintes
-- vérifiées via information_schema.columns + pg_constraint avant d'écrire ce
-- fichier) — cette migration sert de source de vérité pour les
-- environnements Prisma neufs (CI) ; baselinée (migrate resolve --applied)
-- sur la base partagée, jamais exécutée là-bas.
CREATE TABLE "questions_produits" (
  "id" UUID NOT NULL PRIMARY KEY,
  "produit_id" UUID NOT NULL REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "utilisateur_id" UUID NOT NULL REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "question" TEXT NOT NULL,
  "reponse" TEXT,
  "repondu_par" UUID REFERENCES "utilisateurs"("id"),
  "repondu_at" TIMESTAMPTZ,
  "utile_count" INTEGER DEFAULT 0,
  "visible" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);
