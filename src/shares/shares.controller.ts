import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { SharesService } from './shares.service';
import { CreateShareDto } from './dto/create-share.dto';
import { UpdateShareDto } from './dto/update-share.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';

@Controller('shares')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  @Roles('USER', 'ADMIN')
  create(@Body() createShareDto: CreateShareDto) {
    return this.sharesService.create(createShareDto);
  }

  @Get()
  @Roles('USER', 'ADMIN')
  findAll() {
    return this.sharesService.findAll();
  }

  @Get('user/:userId')
  @Roles('USER', 'ADMIN')
  findByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.sharesService.findByUserId(userId);
  }

  @Get('contract/:contractId')
  @Roles('USER', 'ADMIN')
  findByContractId(@Param('contractId', ParseUUIDPipe) contractId: string) {
    return this.sharesService.findByContractId(contractId);
  }

  @Get(':id')
  @Roles('USER', 'ADMIN')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sharesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateShareDto: UpdateShareDto) {
    return this.sharesService.update(id, updateShareDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sharesService.remove(id);
  }
} 