import { IsIn, IsOptional, IsString } from 'class-validator';

const TYPE_CONTENU = ['video', 'article', 'guide', 'pdf'] as const;
const AUDIENCE_CIBLE = ['tous', 'fournisseurs', 'clients', 'transporteurs'] as const;

// Champs alignés sur backend/src/education/service/education.service.js#create.
// Pas de validator dédié côté Express (education.route.js n'en a jamais eu) —
// titre/description/url_contenu sont vérifiés non-vides dans le service, pas
// dans une couche de validation séparée ; on garde ce même partage des
// responsabilités ici (whitelisting des champs dans le DTO, règles métier
// dans EducationService).
export class CreateResourceDto {
  @IsString()
  titre: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsIn(TYPE_CONTENU)
  type_contenu?: (typeof TYPE_CONTENU)[number];

  @IsString()
  url_contenu: string;

  @IsOptional()
  @IsIn(AUDIENCE_CIBLE)
  audience_cible?: (typeof AUDIENCE_CIBLE)[number];

  @IsOptional()
  @IsString()
  tag?: string;
}
