import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mangopay from 'mangopay2-nodejs-sdk';

@Injectable()
export class MangopayConfigService {
  private mangopayApi: any;

  constructor(private configService: ConfigService) {
    this.initMangopay();
  }

  private initMangopay() {
    const clientId = this.configService.get<string>('MANGOPAY_CLIENT_ID');
    const clientApiKey = this.configService.get<string>('MANGOPAY_API_KEY');
    const baseUrl = this.configService.get<string>('MANGOPAY_BASE_URL', 'https://api.sandbox.mangopay.com');
    
    if (!clientId || !clientApiKey) {
      console.warn('Mangopay credentials not found. Using demo mode.');
      return;
    }

    this.mangopayApi = new mangopay({
      clientId: clientId,
      clientApiKey: clientApiKey,
      baseUrl: baseUrl,
    });
  }

  getMangopayApi() {
    if (!this.mangopayApi) {
      throw new Error('Mangopay API not initialized');
    }
    return this.mangopayApi;
  }
} 