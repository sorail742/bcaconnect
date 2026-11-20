import { IsDateString, IsOptional } from 'class-validator';

export class ExportSyscohadaQueryDto {
  @IsOptional()
  @IsDateString()
  debut?: string;

  @IsOptional()
  @IsDateString()
  fin?: string;
}
