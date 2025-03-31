import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { MangopayInfoService } from './mangopay-info.service';
import { CreateMangopayInfoDto } from './dto/create-mangopay-info.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';

@Controller('mangopay-info')
@UseGuards(JwtAuthGuard)
export class MangopayInfoController {
  constructor(private readonly mangopayInfoService: MangopayInfoService) {}

  @Post()
  create(@Body() createMangopayInfoDto: CreateMangopayInfoDto) {
    return this.mangopayInfoService.create(createMangopayInfoDto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.mangopayInfoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mangopayInfoService.findOne(id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.mangopayInfoService.findByUserId(userId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/kyc')
  updateKycStatus(@Param('id') id: string, @Body('kyc') kyc: boolean) {
    return this.mangopayInfoService.updateKycStatus(id, kyc);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mangopayInfoService.remove(id);
  }
} 