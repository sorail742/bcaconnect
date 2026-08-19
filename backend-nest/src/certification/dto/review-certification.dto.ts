import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewCertificationDto {
  @IsIn(['validee', 'rejetee'])
  statut: 'validee' | 'rejetee';

  @IsOptional()
  @IsString()
  commentaire_admin?: string;
}
