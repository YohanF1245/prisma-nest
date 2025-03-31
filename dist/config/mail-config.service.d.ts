import { ConfigService } from '@nestjs/config';
export declare class MailConfigService {
    private configService;
    constructor(configService: ConfigService);
    get emailVerificationTokenExpiration(): string;
    get resetPasswordTokenExpiration(): string;
}
