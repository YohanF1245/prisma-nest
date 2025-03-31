import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(
      createRoleDto.name,
      createRoleDto.description,
    );
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(
      id,
      updateRoleDto.name,
      updateRoleDto.description,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @Post('assign')
  assignRoleToUser(@Body() assignRoleDto: AssignRoleDto) {
    return this.rolesService.assignRoleToUser(
      assignRoleDto.userId,
      assignRoleDto.roleName,
    );
  }

  @Delete('user/:userId/role/:roleId')
  removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rolesService.removeRoleFromUser(userId, roleId);
  }

  @Get('user/:userId')
  getUserRoles(@Param('userId') userId: string) {
    return this.rolesService.getUserRoles(userId);
  }
} 