import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { EducationService } from './education.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { DeleteResourceDto } from './dto/delete-resource.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UpsertQuizDto } from './dto/upsert-quiz.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';

type AuthedRequest = Request & { user: JwtPayload };
type OptionallyAuthedRequest = Request & { user?: JwtPayload };

// Réplique backend/src/education/routes/education.route.js (BCA Academy,
// cahier des charges 3.14) — même ordre de déclaration des routes, mêmes
// gardes (optionalAuth -> OptionalJwtAuthGuard, grantAccess('manage_education')
// -> PermissionsGuard + @RequirePermission).
@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Req() req: OptionallyAuthedRequest) {
    return this.educationService.getAllResources(req.user);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('manage_education')
  findAllAdmin() {
    return this.educationService.getAllAdmin();
  }

  @Get('progress/me')
  @UseGuards(JwtAuthGuard)
  getMyProgress(@Req() req: AuthedRequest) {
    return this.educationService.getMyProgress(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('manage_education')
  create(@Body() dto: CreateResourceDto) {
    return this.educationService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('manage_education')
  update(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
    return this.educationService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('manage_education')
  remove(@Param('id') id: string, @Req() req: AuthedRequest, @Body() body: DeleteResourceDto) {
    const ip = req.ip ?? null;
    const userAgent = req.headers['user-agent'] ?? null;
    return this.educationService.remove(id, req.user, ip, userAgent, body?.confirmation_nom);
  }

  @Post(':id/view')
  @UseGuards(JwtAuthGuard)
  markViewed(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.educationService.markViewed(id, req.user.id);
  }

  @Get(':id/quiz')
  @UseGuards(JwtAuthGuard)
  getQuizForLearner(@Param('id') id: string) {
    return this.educationService.getQuizForLearner(id);
  }

  @Post(':id/quiz/submit')
  @UseGuards(JwtAuthGuard)
  submitQuiz(@Param('id') id: string, @Body() dto: SubmitQuizDto, @Req() req: AuthedRequest) {
    return this.educationService.submitQuiz(id, dto.reponses, req.user.id);
  }

  @Get(':id/quiz/admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('manage_education')
  getQuizForAdmin(@Param('id') id: string) {
    return this.educationService.getQuizForAdmin(id);
  }

  @Put(':id/quiz')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('manage_education')
  upsertQuiz(@Param('id') id: string, @Body() dto: UpsertQuizDto) {
    return this.educationService.upsertQuiz(id, dto);
  }
}
