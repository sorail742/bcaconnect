-- Table déjà créée par Sequelize sur la base partagée (colonnes/contrainte
-- vérifiées via information_schema.columns + pg_constraint avant d'écrire ce
-- fichier) — cette migration sert de source de vérité pour les
-- environnements Prisma neufs (CI) ; baselinée (migrate resolve --applied)
-- sur la base partagée, jamais exécutée là-bas.
CREATE TABLE "certifications" (
  "id" UUID NOT NULL PRIMARY KEY,
  "fournisseur_id" UUID NOT NULL,
  "type" VARCHAR(100) NOT NULL,
  "document_url" VARCHAR(255) NOT NULL,
  "statut" VARCHAR(20) DEFAULT 'en_attente',
  "commentaire_admin" TEXT,
  "date_expiration" DATE,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);

-- utilisateurs existe déjà à ce stade (cf. migration 2b_stub_utilisateurs_for_ci,
-- appliquée avant celle-ci dans l'ordre lexicographique des dossiers).
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_fournisseur_id_fkey" FOREIGN KEY ("fournisseur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
