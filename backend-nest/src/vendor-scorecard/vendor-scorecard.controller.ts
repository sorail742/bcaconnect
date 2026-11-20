import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { VendorScorecardService } from './vendor-scorecard.service';

// Public — comme le badge de vérification, préqualification visible par tout
// acheteur avant de commander (analyse concurrentielle #6). Réplique
// backend/src/vendor-scorecard/routes/vendorScorecard.route.js : aucun
// `protect`, donc pas de JwtAuthGuard ici.
@Controller('vendor-scorecard')
export class VendorScorecardController {
  constructor(
    private readonly vendorScorecardService: VendorScorecardService,
  ) {}

  @Get(':vendorId')
  getScorecard(@Param('vendorId', ParseUUIDPipe) vendorId: string) {
    return this.vendorScorecardService.getScorecard(vendorId);
  }
}
