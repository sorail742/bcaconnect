import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';

type AuthedRequest = Request & { user: JwtPayload };

// Réplique backend/src/category/routes/category.route.js : lecture
// publique, mutations réservées à la permission 'manage_categories'
// (portage exact de grantAccess('manage_categories')).
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll() {
    return this.categoryService.findAllRootWithChildren();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('manage_categories')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('manage_categories')
  update(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('manage_categories')
  remove(@Param('id') id: string, @Req() req: AuthedRequest, @Body() body: DeleteCategoryDto) {
    const ip = req.ip ?? null;
    const userAgent = req.headers['user-agent'] ?? null;
    return this.categoryService.remove(id, req.user, ip, userAgent, body?.confirmation_nom);
  }
}
