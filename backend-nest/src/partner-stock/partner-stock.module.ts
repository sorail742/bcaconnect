import { Module } from '@nestjs/common';
import { PartnerStockController } from './partner-stock.controller';
import { PartnerStockService } from './partner-stock.service';

@Module({
  controllers: [PartnerStockController],
  providers: [PartnerStockService],
})
export class PartnerStockModule {}
