import { Module } from '@nestjs/common';
import { PriceMedianHistoryService } from './price-median-history.service';
import { PriceMedianHistoryController } from './price-median-history.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [PrismaModule, RolesModule],
  controllers: [PriceMedianHistoryController],
  providers: [PriceMedianHistoryService],
  exports: [PriceMedianHistoryService],
})
export class PriceMedianHistoryModule {} 