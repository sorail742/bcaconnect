import { IsIn, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

const TYPES_STOCK = ['consigne', 'entrepot_tiers', 'dropshipping'] as const;

export class CreatePartnerStockDto {
  @IsString()
  @Length(2, 150)
  partenaire_nom: string;

  @IsOptional()
  @IsString()
  @Length(0, 150)
  partenaire_contact?: string;

  @IsOptional()
  @IsIn(TYPES_STOCK)
  type_stock?: (typeof TYPES_STOCK)[number];

  @IsInt()
  @Min(0)
  quantite: number;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  localisation?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}
