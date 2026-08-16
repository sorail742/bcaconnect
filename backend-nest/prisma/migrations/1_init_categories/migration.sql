-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "nom_categorie" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "statut" VARCHAR(20) DEFAULT 'actif',
    "image_url" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_nom_categorie_key" ON "categories"("nom_categorie");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
