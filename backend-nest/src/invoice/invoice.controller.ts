import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { InvoiceService } from './invoice.service';
import { CreateFromOrderDto } from './dto/create-from-order.dto';
import { ExportSyscohadaQueryDto } from './dto/export-syscohada-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';

type AuthedRequest = Request & { user: JwtPayload };

// Réplique backend/src/invoice/routes/invoice.route.js : toutes les routes
// exigent seulement un jeton valide (`protect` = authMiddleware, sans
// restriction de rôle) — le contrôle d'accès fin (acheteur/vendeur/admin)
// vit dans le service, pas dans un guard. Les routes statiques (mine,
// vendor-mine, export/syscohada) sont déclarées AVANT :id — Nest/Express
// matche par ordre de déclaration à spécificité égale (un seul segment).
@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get('mine')
  listMine(@Req() req: AuthedRequest) {
    return this.invoiceService.listMine(req.user.id);
  }

  @Get('vendor-mine')
  listVendorMine(@Req() req: AuthedRequest) {
    return this.invoiceService.listForVendor(req.user.id);
  }

  @Get('export/syscohada')
  async exportSyscohada(
    @Query() query: ExportSyscohadaQueryDto,
    @Req() req: AuthedRequest,
    @Res() res: Response,
  ) {
    const csv = await this.invoiceService.exportSyscohadaJournal(
      req.user,
      query,
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="journal_ventes_syscohada_${Date.now()}.csv"`,
    );
    const BOM = String.fromCharCode(0xfeff); // accents lisibles à l'ouverture directe dans Excel
    res.send(BOM + csv);
  }

  @Post('from-order/:orderId')
  createFromOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: CreateFromOrderDto,
    @Req() req: AuthedRequest,
  ) {
    return this.invoiceService.getOrCreateForOrder(orderId, dto, req.user);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthedRequest) {
    return this.invoiceService.getById(id, req.user);
  }
}
