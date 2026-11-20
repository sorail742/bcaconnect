import { Module } from '@nestjs/common';
import { VendorScorecardController } from './vendor-scorecard.controller';
import { VendorScorecardService } from './vendor-scorecard.service';

@Module({
  controllers: [VendorScorecardController],
  providers: [VendorScorecardService],
})
export class VendorScorecardModule {}
