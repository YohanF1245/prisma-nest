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
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Get()
  @Roles('USER', 'ADMIN')
  findAll() {
    return this.contractsService.findAll();
  }

  @Get('user')
  @Roles('USER', 'ADMIN')
  findUserContracts(@User('id') userId: string) {
    return this.contractsService.getUserContracts(userId);
  }

  @Get(':id')
  @Roles('USER', 'ADMIN')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.remove(id);
  }

  @Patch(':id/activate')
  @Roles('ADMIN')
  activateContract(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.activateContract(id);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN')
  deactivateContract(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.deactivateContract(id);
  }

  @Patch(':id/secondary-market')
  @Roles('ADMIN')
  toggleSecondaryMarket(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('enabled') enabled: boolean,
  ) {
    return this.contractsService.toggleSecondaryMarket(id, enabled);
  }

  @Post(':id/users/:userId')
  @Roles('ADMIN')
  addUserToContract(
    @Param('id', ParseUUIDPipe) contractId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body('role') role: string,
  ) {
    return this.contractsService.addUserToContract(contractId, userId, role);
  }

  @Delete(':id/users/:userId')
  @Roles('ADMIN')
  removeUserFromContract(
    @Param('id', ParseUUIDPipe) contractId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.contractsService.removeUserFromContract(contractId, userId);
  }

  @Patch(':id/users/:userId/role')
  @Roles('ADMIN')
  updateUserRole(
    @Param('id', ParseUUIDPipe) contractId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body('role') role: string,
  ) {
    return this.contractsService.updateUserRole(contractId, userId, role);
  }
} 