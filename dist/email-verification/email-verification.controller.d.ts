import { EmailVerificationService } from './email-verification.service';
export declare class EmailVerificationController {
    private emailVerificationService;
    constructor(emailVerificationService: EmailVerificationService);
    sendVerificationEmail(req: any): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
}
