import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCertificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  document_url: string;

  @IsOptional()
  @IsDateString()
  date_expiration?: string;
}
