import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

// Champs volontairement tolérants (produit_id OU id, quantite OU quantity) :
// réplique la souplesse de l'original côté panier frontend
// (couponService.validateCart), jamais un contrat strict côté client.
export class CartItemDto {
  @IsOptional()
  @IsUUID()
  produit_id?: string;

  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsNumber()
  quantite?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  prix_unitaire?: number;
}

export class ValidateCouponDto {
  @IsString()
  code!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items!: CartItemDto[];
}
