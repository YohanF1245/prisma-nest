import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailConfigService {
  constructor(private configService: ConfigService) {}

  get emailVerificationTokenExpiration(): string {
    return this.configService.get<string>('EMAIL_VERIFICATION_TOKEN_EXPIRATION') || '24h';
  }

  get resetPasswordTokenExpiration(): string {
    return this.configService.get<string>('RESET_PASSWORD_TOKEN_EXPIRATION') || '1h';
  }
} 