import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { WebinarService } from './webinar.service';
import { CreateWebinarDto } from './dto/create-webinar.dto';
import { UpdateWebinarDto } from './dto/update-webinar.dto';
import { DeleteWebinarDto } from './dto/delete-webinar.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';

type AuthedRequest = Request & { user: JwtPayload };

// Réplique backend/src/webinar/routes/webinar.route.js : toutes les routes
// exigent une authentification ; les mutations exigent la permission
// 'manage_content' (portage exact de grantAccess('manage_content')).
@Controller('webinars')
@UseGuards(JwtAuthGuard)
export class WebinarController {
  constructor(private readonly webinarService: WebinarService) {}

  @Get()
  findAll() {
    return this.webinarService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.webinarService.findById(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission('manage_content')
  create(@Body() dto: CreateWebinarDto) {
    return this.webinarService.create(dto);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('manage_content')
  update(@Param('id') id: string, @Body() dto: UpdateWebinarDto) {
    return this.webinarService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('manage_content')
  remove(@Param('id') id: string, @Req() req: AuthedRequest, @Body() body: DeleteWebinarDto) {
    const ip = req.ip ?? null;
    const userAgent = req.headers['user-agent'] ?? null;
    return this.webinarService.remove(id, req.user, ip, userAgent, body?.confirmation_nom);
  }
}
