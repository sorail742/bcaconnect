import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CertificationService } from './certification.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { ReviewCertificationDto } from './dto/review-certification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';

type AuthedRequest = Request & { user: JwtPayload };

// Réplique backend/src/certification/routes/certification.route.js : statut
// vendeur public, création/consultation réservées au fournisseur, revue
// réservée à l'admin (RolesGuard reproduit exactement authorize(...roles),
// bypass admin inclus).
@Controller('certifications')
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  @Get('vendor/:vendorId/status')
  getVendorStatus(@Param('vendorId', ParseUUIDPipe) vendorId: string) {
    return this.certificationService.getVendorStatus(vendorId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fournisseur')
  create(@Body() dto: CreateCertificationDto, @Req() req: AuthedRequest) {
    return this.certificationService.create(dto, req.user.id);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fournisseur')
  getMine(@Req() req: AuthedRequest) {
    return this.certificationService.getMine(req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAll(@Query('statut') statut?: string) {
    return this.certificationService.getAll(statut);
  }

  @Put(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  review(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReviewCertificationDto) {
    return this.certificationService.review(id, dto);
  }
}
