import { Module } from '@nestjs/common';
import { MangopayInfoService } from './mangopay-info.service';
import { MangopayInfoController } from './mangopay-info.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [MangopayInfoController],
  providers: [MangopayInfoService],
  exports: [MangopayInfoService],
})
export class MangopayInfoModule {} 