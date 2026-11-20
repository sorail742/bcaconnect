import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AlertThresholdService } from './alert-threshold.service';
import { CreateAlertThresholdDto } from './dto/create-alert-threshold.dto';
import { ToggleAlertThresholdDto } from './dto/toggle-alert-threshold.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';

type AuthedRequest = Request & { user: JwtPayload };

// Réplique backend/src/alert-threshold/routes/alertThreshold.route.js.
@Controller('alert-thresholds')
@UseGuards(JwtAuthGuard)
export class AlertThresholdController {
  constructor(private readonly alertThresholdService: AlertThresholdService) {}

  @Get('mine')
  listMine(@Req() req: AuthedRequest) {
    return this.alertThresholdService.listMine(req.user.id);
  }

  @Post()
  createOrUpdate(
    @Body() dto: CreateAlertThresholdDto,
    @Req() req: AuthedRequest,
  ) {
    return this.alertThresholdService.createOrUpdate(req.user.id, dto);
  }

  @Patch(':id/toggle')
  toggle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleAlertThresholdDto,
    @Req() req: AuthedRequest,
  ) {
    return this.alertThresholdService.toggle(id, req.user.id, dto.actif);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthedRequest) {
    return this.alertThresholdService.remove(id, req.user.id);
  }
}
