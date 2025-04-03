import { Module } from '@nestjs/common';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesModule } from '../roles/roles.module';
import { MangopayWalletModule } from '../mangopay-wallet/mangopay-wallet.module';
import { PriceMedianHistoryModule } from '../price-median-history/price-median-history.module';

@Module({
  imports: [PrismaModule, RolesModule, MangopayWalletModule, PriceMedianHistoryModule],
  controllers: [SharesController],
  providers: [SharesService],
  exports: [SharesService],
})
export class SharesModule {} 