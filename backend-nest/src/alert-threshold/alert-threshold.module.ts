import { Module } from '@nestjs/common';
import { AlertThresholdController } from './alert-threshold.controller';
import { AlertThresholdService } from './alert-threshold.service';

@Module({
  controllers: [AlertThresholdController],
  providers: [AlertThresholdService],
})
export class AlertThresholdModule {}
