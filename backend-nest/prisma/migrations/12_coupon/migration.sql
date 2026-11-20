-- Tables déjà créées par Sequelize sur la base partagée (colonnes/contraintes
-- vérifiées via information_schema.columns + pg_constraint avant d'écrire ce
-- fichier) — ces stand-in servent de source de vérité pour les
-- environnements Prisma neufs (CI) ; baselinées (migrate resolve --applied)
-- sur la base partagée, jamais exécutées là-bas. Contrairement aux modules
-- purement HTTP déjà migrés, ces deux tables restent aussi écrites par
-- Sequelize après le cutover (voir schema.prisma) : order.service.js garde
-- un accès direct via coupon.service.js#validate/recordUsage.
CREATE TABLE IF NOT EXISTS "coupons" (
  "id" UUID NOT NULL PRIMARY KEY,
  "code" VARCHAR(30) NOT NULL UNIQUE,
  "createur_id" UUID NOT NULL REFERENCES "utilisateurs"("id"),
  "boutique_id" UUID REFERENCES "boutiques"("id"),
  "type" VARCHAR(15) NOT NULL DEFAULT 'percentage',
  "valeur" NUMERIC(15,2) NOT NULL,
  "montant_min" NUMERIC(15,2),
  "date_debut" TIMESTAMPTZ,
  "date_fin" TIMESTAMPTZ,
  "usage_max" INTEGER,
  "usage_max_par_utilisateur" INTEGER DEFAULT 1,
  "usage_count" INTEGER DEFAULT 0,
  "actif" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "coupon_usages" (
  "id" UUID NOT NULL PRIMARY KEY,
  "coupon_id" UUID NOT NULL REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "utilisateur_id" UUID NOT NULL REFERENCES "utilisateurs"("id"),
  "commande_id" UUID,
  "montant_reduction" NUMERIC(15,2) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
