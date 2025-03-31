import { Module } from '@nestjs/common';
import { MangopayKycService } from './mangopay-kyc.service';
import { MangopayKycController } from './mangopay-kyc.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '../config/config.module';
import { MangopayInfoModule } from '../mangopay-info/mangopay-info.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    PrismaModule, 
    ConfigModule, 
    MangopayInfoModule,
    MulterModule.register({
      dest: './uploads', // Stockage temporaire des fichiers
    }),
  ],
  controllers: [MangopayKycController],
  providers: [MangopayKycService],
  exports: [MangopayKycService],
})
export class MangopayKycModule {} 