-- Table déjà créée et alimentée par Sequelize sur la base partagée
-- (colonnes/contraintes vérifiées via information_schema.columns +
-- pg_constraint avant d'écrire ce fichier) — ce stand-in minimal sert de
-- source de vérité pour les environnements Prisma neufs (CI) ; baselinée
-- (migrate resolve --applied) sur la base partagée, jamais exécutée là-bas.
-- Contrairement aux autres modules migrés, cette table reste possédée par
-- Sequelize après le cutover (voir schema.prisma) : seule l'API de lecture
-- change de moteur.
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" UUID NOT NULL PRIMARY KEY,
  "action" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "table_affectee" VARCHAR(50),
  "id_enregistrement" UUID,
  "adresse_ip" VARCHAR(45),
  "agent_utilisateur" TEXT,
  "niveau_alerte" VARCHAR(10) DEFAULT 'info',
  "utilisateur_id" UUID REFERENCES "utilisateurs"("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
