import { ConfigService } from '@nestjs/config';
export interface MailOptions {
    to: string | string[];
    subject: string;
    template: string;
    context: Record<string, any>;
    attachments?: {
        filename: string;
        content?: any;
        path?: string;
        contentType?: string;
    }[];
}
export declare class MailService {
    private configService;
    private transporter;
    private readonly logger;
    private templatesDir;
    constructor(configService: ConfigService);
    private initializeTransporter;
    sendMail(options: MailOptions): Promise<boolean>;
    sendVerificationEmail(email: string, name: string, token: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean>;
    sendNotification(email: string, name: string, subject: string, message: string): Promise<boolean>;
    sendMarketingEmail(emails: string[], subject: string, content: string, attachments?: any[]): Promise<boolean>;
    private loadTemplate;
    private createDefaultTemplate;
}
