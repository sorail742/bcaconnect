import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFromOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  acheteur_nif?: string;
}
