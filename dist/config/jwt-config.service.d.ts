import { ConfigService } from '@nestjs/config';
export declare class JwtConfigService {
    private configService;
    constructor(configService: ConfigService);
    get secret(): string;
    get expirationTime(): string;
}
