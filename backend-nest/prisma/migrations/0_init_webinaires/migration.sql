-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "enum_webinaires_statut" AS ENUM ('a_venir', 'en_direct', 'termine');

-- CreateTable
CREATE TABLE "webinaires" (
    "id" UUID NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "date_heure" TIMESTAMPTZ(6) NOT NULL,
    "intervenant" VARCHAR(255) NOT NULL,
    "categorie" VARCHAR(255),
    "statut" "enum_webinaires_statut" DEFAULT 'a_venir',
    "participants_count" INTEGER DEFAULT 0,
    "lien_rejoindre" VARCHAR(255),
    "video_url" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "webinaires_pkey" PRIMARY KEY ("id")
);

