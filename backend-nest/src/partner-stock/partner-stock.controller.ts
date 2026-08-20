import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { PartnerStockService } from './partner-stock.service';
import { CreatePartnerStockDto } from './dto/create-partner-stock.dto';
import { UpdatePartnerStockDto } from './dto/update-partner-stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';

type AuthedRequest = Request & { user: JwtPayload };

// Réplique backend/src/partner-stock/routes/partnerStock.route.js : toutes
// les routes exigent checkPermission('PRODUCTS_EDIT_OWN') = ['admin',
// 'fournisseur'] — identique en effet à @Roles('fournisseur') (bypass admin
// automatique dans RolesGuard). La vérification fine (le produit
// appartient-il VRAIMENT à ce fournisseur précis ?) reste dans le service
// (assertOwnsProduct), pas dans le guard.
@Controller('partner-stock')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('fournisseur')
export class PartnerStockController {
  constructor(private readonly partnerStockService: PartnerStockService) {}

  @Get('product/:produitId')
  listByProduct(@Param('produitId', ParseUUIDPipe) produitId: string, @Req() req: AuthedRequest) {
    return this.partnerStockService.listByProduct(produitId, req.user);
  }

  @Get('product/:produitId/total')
  getTotalStock(@Param('produitId', ParseUUIDPipe) produitId: string, @Req() req: AuthedRequest) {
    return this.partnerStockService.getTotalStock(produitId, req.user);
  }

  @Post('product/:produitId')
  create(@Param('produitId', ParseUUIDPipe) produitId: string, @Body() dto: CreatePartnerStockDto, @Req() req: AuthedRequest) {
    return this.partnerStockService.create(produitId, dto, req.user);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePartnerStockDto, @Req() req: AuthedRequest) {
    return this.partnerStockService.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthedRequest) {
    return this.partnerStockService.remove(id, req.user);
  }
}
