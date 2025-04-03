import { Module } from '@nestjs/common';
import { MangopayInfoService } from './mangopay-info.service';
import { MangopayInfoController } from './mangopay-info.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '../config/config.module';
import { AddressModule } from '../address/address.module';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, ConfigModule, AddressModule, RolesModule, AuthModule],
  controllers: [MangopayInfoController],
  providers: [MangopayInfoService],
  exports: [MangopayInfoService],
})
export class MangopayInfoModule {} 