import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

// Réplique backend/src/audit-log/routes/auditLog.route.js :
// `router.use(authMiddleware, grantAccess('view_audit_logs'))` s'appliquait
// à toutes les routes du module -> guards posés au niveau du contrôleur.
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('view_audit_logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  getAll(@Query() query: AuditLogQueryDto) {
    return this.auditLogService.getAll(query);
  }

  @Get('user/:userId/summary')
  getUserActivitySummary(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.auditLogService.getUserActivitySummary(userId);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditLogService.getById(id);
  }
}
