-- CreateEnum
CREATE TYPE "enum_educational_resources_type_contenu" AS ENUM ('video', 'article', 'guide', 'pdf');

-- CreateEnum
CREATE TYPE "enum_educational_resources_audience_cible" AS ENUM ('tous', 'fournisseurs', 'clients', 'transporteurs');

-- CreateTable
CREATE TABLE "educational_resources" (
    "id" UUID NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "type_contenu" "enum_educational_resources_type_contenu" DEFAULT 'article',
    "url_contenu" VARCHAR(500) NOT NULL,
    "audience_cible" "enum_educational_resources_audience_cible" DEFAULT 'tous',
    "tag" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "educational_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educational_quizzes" (
    "id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "questions" JSON NOT NULL DEFAULT '[]',
    "passing_score" INTEGER DEFAULT 60,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "educational_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educational_progress" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "statut" VARCHAR(20) DEFAULT 'vu',
    "quiz_score" INTEGER,
    "tentatives" INTEGER DEFAULT 0,
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "educational_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "educational_quizzes_resource_id_key" ON "educational_quizzes"("resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "educational_progress_utilisateur_id_resource_id" ON "educational_progress"("utilisateur_id", "resource_id");

-- AddForeignKey
ALTER TABLE "educational_quizzes" ADD CONSTRAINT "educational_quizzes_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "educational_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educational_progress" ADD CONSTRAINT "educational_progress_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "educational_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
