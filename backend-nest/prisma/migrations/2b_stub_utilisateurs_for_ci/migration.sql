-- Table utilisateurs minimale, pour que les environnements Prisma neufs (CI)
-- puissent satisfaire la FK ajoutée par la migration suivante
-- (2_educational_progress_user_fk -> educational_progress.utilisateur_id)
-- sans exécuter le schéma Sequelize complet, que Prisma ne connaît pas.
--
-- Sur la base partagée, la vraie table utilisateurs existe déjà (créée par
-- Sequelize, avec beaucoup plus de colonnes) : IF NOT EXISTS rend cette
-- migration inoffensive si elle y était rejouée pour de vrai — elle est de
-- toute façon baselinée (migrate resolve --applied), jamais exécutée là-bas.
CREATE TABLE IF NOT EXISTS "utilisateurs" (
  "id" UUID PRIMARY KEY,
  "nom_complet" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "telephone" TEXT NOT NULL,
  "mot_de_passe" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'client',
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);
