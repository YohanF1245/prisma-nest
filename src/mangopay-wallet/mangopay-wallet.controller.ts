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
import { MangopayWalletService } from './mangopay-wallet.service';
import { CreateMangopayWalletDto } from './dto/create-mangopay-wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';

@Controller('mangopay-wallet')
@UseGuards(JwtAuthGuard)
export class MangopayWalletController {
  constructor(private readonly mangopayWalletService: MangopayWalletService) {}

  @Post()
  create(@Body() createMangopayWalletDto: CreateMangopayWalletDto) {
    return this.mangopayWalletService.create(createMangopayWalletDto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.mangopayWalletService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mangopayWalletService.findOne(id);
  }

  @Get('info/:mangopayInfoId')
  findByMangopayInfoId(@Param('mangopayInfoId') mangopayInfoId: string) {
    return this.mangopayWalletService.findByMangopayInfoId(mangopayInfoId);
  }

  @Patch(':id/balance')
  updateBalance(@Param('id') id: string) {
    return this.mangopayWalletService.updateBalance(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mangopayWalletService.remove(id);
  }
} 