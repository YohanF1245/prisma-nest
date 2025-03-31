import { Module } from '@nestjs/common';
import { MangopayWalletService } from './mangopay-wallet.service';
import { MangopayWalletController } from './mangopay-wallet.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '../config/config.module';
import { MangopayInfoModule } from '../mangopay-info/mangopay-info.module';

@Module({
  imports: [PrismaModule, ConfigModule, MangopayInfoModule],
  controllers: [MangopayWalletController],
  providers: [MangopayWalletService],
  exports: [MangopayWalletService],
})
export class MangopayWalletModule {} 