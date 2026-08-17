-- educational_progress.utilisateur_id référence utilisateurs (table encore
-- possédée par Sequelize, jamais modélisée dans schema.prisma — Prisma ne
-- génère donc pas cette contrainte automatiquement). Elle existe déjà
-- réellement dans la base partagée (créée par les migrations Sequelize,
-- vérifiée via pg_constraint) ; cette migration l'ajoute explicitement côté
-- Prisma pour que les environnements neufs (CI) aient un schéma identique —
-- sans ça, un id utilisateur invalide serait silencieusement accepté en CI
-- alors qu'il serait rejeté en production, l'inverse de ce qu'on veut d'un
-- environnement de test.
ALTER TABLE "educational_progress" ADD CONSTRAINT "educational_progress_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
