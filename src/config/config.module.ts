import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { JwtConfigService } from './jwt-config.service';
import { MailConfigService } from './mail-config.service';
import { MangopayConfigService } from './mangopay-config.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  providers: [JwtConfigService, MailConfigService, MangopayConfigService],
  exports: [JwtConfigService, MailConfigService, MangopayConfigService],
})
export class ConfigModule {} 