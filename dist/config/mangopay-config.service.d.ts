import { ConfigService } from '@nestjs/config';
export declare class MangopayConfigService {
    private configService;
    private mangopayApi;
    constructor(configService: ConfigService);
    private initMangopay;
    getMangopayApi(): any;
}
