import { Module } from '@nestjs/common';
import { PriceIndexController } from './price-index.controller';
import { PriceIndexService } from './price-index.service';

@Module({
  controllers: [PriceIndexController],
  providers: [PriceIndexService],
})
export class PriceIndexModule {}
