import { IsIn, IsOptional, IsString } from 'class-validator';

const TYPE_CONTENU = ['video', 'article', 'guide', 'pdf'] as const;
const AUDIENCE_CIBLE = ['tous', 'fournisseurs', 'clients', 'transporteurs'] as const;

// Contrairement à CreateResourceDto, tous les champs sont optionnels — même
// comportement que education.service.js#update (chaque champ omis conserve
// sa valeur existante via `??`).
export class UpdateResourceDto {
  @IsOptional()
  @IsString()
  titre?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(TYPE_CONTENU)
  type_contenu?: (typeof TYPE_CONTENU)[number];

  @IsOptional()
  @IsString()
  url_contenu?: string;

  @IsOptional()
  @IsIn(AUDIENCE_CIBLE)
  audience_cible?: (typeof AUDIENCE_CIBLE)[number];

  @IsOptional()
  @IsString()
  tag?: string;
}
