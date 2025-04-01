import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { RightOwnersService } from './right-owners.service';
import { CreateRightOwnerDto } from './dto/create-right-owner.dto';
import { UpdateRightOwnerDto } from './dto/update-right-owner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';

@Controller('right-owners')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RightOwnersController {
  constructor(private readonly rightOwnersService: RightOwnersService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createRightOwnerDto: CreateRightOwnerDto) {
    return this.rightOwnersService.create(createRightOwnerDto);
  }

  @Get()
  @Roles('USER', 'ADMIN')
  findAll() {
    return this.rightOwnersService.findAll();
  }

  @Get('ipi/:ipiNumber')
  @Roles('USER', 'ADMIN')
  findByIPI(@Param('ipiNumber') ipiNumber: string) {
    return this.rightOwnersService.findByIPI(ipiNumber);
  }

  @Get(':id')
  @Roles('USER', 'ADMIN')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rightOwnersService.findOne(id);
  }

  @Get(':id/contracts')
  @Roles('USER', 'ADMIN')
  getContracts(@Param('id', ParseUUIDPipe) id: string) {
    return this.rightOwnersService.getContracts(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRightOwnerDto: UpdateRightOwnerDto,
  ) {
    return this.rightOwnersService.update(id, updateRightOwnerDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rightOwnersService.remove(id);
  }
} 