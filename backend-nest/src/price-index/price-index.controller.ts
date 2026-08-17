import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { PriceIndexService } from './price-index.service';
import { PriceIndexQueryDto } from './dto/price-index-query.dto';

const DEFAULT_MONTHS = 6;

// Réplique backend/src/price-index/routes/priceIndex.route.js : public —
// transparence marché (analyse concurrentielle #8), aucune donnée sensible
// exposée (uniquement des moyennes de prix agrégées, jamais une commande ou
// un utilisateur individuel).
@Controller('price-index')
export class PriceIndexController {
  constructor(private readonly priceIndexService: PriceIndexService) {}

  @Get('category/:categorieId')
  getByCategory(@Param('categorieId', ParseUUIDPipe) categorieId: string, @Query() query: PriceIndexQueryDto) {
    return this.priceIndexService.getByCategory(categorieId, query.months ?? DEFAULT_MONTHS);
  }

  @Get('product/:produitId')
  getByProduct(@Param('produitId', ParseUUIDPipe) produitId: string, @Query() query: PriceIndexQueryDto) {
    return this.priceIndexService.getByProduct(produitId, query.months ?? DEFAULT_MONTHS);
  }
}
