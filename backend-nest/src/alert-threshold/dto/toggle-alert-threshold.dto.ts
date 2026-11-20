import { IsBoolean } from 'class-validator';

export class ToggleAlertThresholdDto {
  @IsBoolean()
  actif!: boolean;
}
