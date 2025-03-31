import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtConfigService {
  constructor(private configService: ConfigService) {}

  get secret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'super-secret-jwt-key-change-in-production';
  }

  get expirationTime(): string {
    return this.configService.get<string>('JWT_EXPIRATION_TIME') || '1h';
  }
} 