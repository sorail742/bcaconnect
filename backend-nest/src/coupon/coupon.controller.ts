import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';

type AuthedRequest = Request & { user: JwtPayload };

// Réplique backend/src/coupon/routes/coupon.route.js : authorize('admin',
// 'fournisseur') -> @Roles('fournisseur') (bypass admin automatique dans
// RolesGuard, voir certification.controller.ts/partner-stock.controller.ts).
@Controller('coupons')
@UseGuards(JwtAuthGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('fournisseur')
  async create(@Body() dto: CreateCouponDto, @Req() req: AuthedRequest) {
    const coupon = await this.couponService.create(dto, req.user);
    return { message: 'Code promo créé.', coupon };
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles('fournisseur')
  getMine(@Req() req: AuthedRequest) {
    return this.couponService.getMine(req.user);
  }

  @Post('validate')
  validate(@Body() dto: ValidateCouponDto, @Req() req: AuthedRequest) {
    return this.couponService.validateCart(dto, req.user);
  }

  @Put(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles('fournisseur')
  toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthedRequest,
  ) {
    return this.couponService.toggleActive(id, req.user);
  }

  @Get(':id/stats')
  @UseGuards(RolesGuard)
  @Roles('fournisseur')
  getStats(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthedRequest) {
    return this.couponService.getStats(id, req.user);
  }
}
