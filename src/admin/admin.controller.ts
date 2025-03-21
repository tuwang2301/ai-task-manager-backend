import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/role.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles('admin') // Chỉ admin mới được truy cập
  getAdminDashboard() {
    return { message: 'Welcome Admin!' };
  }
}
