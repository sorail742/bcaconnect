import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class AuditLogQueryDto {
  // page/limit restent des chaînes ici : le service reproduit le parsing
  // tolérant de l'original (parseInt avec repli silencieux sur une valeur
  // par défaut plutôt qu'un 400 sur une entrée non numérique).
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  niveau_alerte?: string;

  @IsOptional()
  @IsUUID()
  utilisateur_id?: string;

  @IsOptional()
  @IsString()
  adresse_ip?: string;

  @IsOptional()
  @IsString()
  date_debut?: string;

  @IsOptional()
  @IsString()
  date_fin?: string;

  @IsOptional()
  @IsIn(['recent', 'ancien'])
  sort?: string;
}
