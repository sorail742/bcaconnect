import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

// Champs alignés sur backend/src/category/validator/category.validator.js
// (validateCreateCategory). parent_id n'était pas validé côté Express (pas
// de contrôle de format) — resserré ici en UUID optionnel, dans le même
// esprit que les DTOs webinar (tightening non régressif, pas de nouveau
// champ requis).
export class CreateCategoryDto {
  @IsString()
  @Length(2, 100, { message: 'Le nom doit faire entre 2 et 100 caractères.' })
  nom_categorie: string;

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'La description ne doit pas dépasser 500 caractères.' })
  description?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: "L'URL de l'image ne doit pas dépasser 255 caractères." })
  image_url?: string;

  @IsOptional()
  @IsUUID()
  parent_id?: string;
}
