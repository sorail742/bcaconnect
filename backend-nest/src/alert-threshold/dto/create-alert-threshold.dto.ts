import { IsIn, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateAlertThresholdDto {
  @IsUUID()
  produit_id!: string;

  @IsIn(['prix_produit', 'stock_produit'])
  type!: string;

  @IsOptional()
  @IsIn(['inferieur_egal', 'superieur_egal'])
  operateur?: string;

  @IsNumber()
  @Min(0)
  valeur_seuil!: number;
}
