import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesModule } from '../roles/roles.module';
import { MangopayWalletModule } from '../mangopay-wallet/mangopay-wallet.module';
import { PriceMedianHistoryModule } from '../price-median-history/price-median-history.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, RolesModule, MangopayWalletModule, PriceMedianHistoryModule, NotificationsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {} 