import {
  IsIn,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code!: string;

  @IsIn(['percentage', 'fixed'])
  type!: string;

  @IsNumber()
  valeur!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  montant_min?: number;

  @IsOptional()
  @IsISO8601()
  date_debut?: string;

  @IsOptional()
  @IsISO8601()
  date_fin?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  usage_max?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  usage_max_par_utilisateur?: number;
}
