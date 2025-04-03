import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Roles('USER', 'ADMIN')
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @Roles('USER', 'ADMIN')
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('buyer/:buyerId')
  @Roles('USER', 'ADMIN')
  findByBuyerId(@Param('buyerId', ParseUUIDPipe) buyerId: string) {
    return this.transactionsService.findByBuyerId(buyerId);
  }

  @Get('seller/:sellerId')
  @Roles('USER', 'ADMIN')
  findBySellerId(@Param('sellerId', ParseUUIDPipe) sellerId: string) {
    return this.transactionsService.findBySellerId(sellerId);
  }

  @Get(':id')
  @Roles('USER', 'ADMIN')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.remove(id);
  }
} 