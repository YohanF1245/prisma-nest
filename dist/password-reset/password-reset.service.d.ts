import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { MailConfigService } from '../config/mail-config.service';
import { MailService } from '../mail/mail.service';
export declare class PasswordResetService {
    private prisma;
    private usersService;
    private mailConfigService;
    private mailService;
    constructor(prisma: PrismaService, usersService: UsersService, mailConfigService: MailConfigService, mailService: MailService);
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    confirmPasswordReset(token: string, newPassword: string): Promise<{
        message: string;
    }>;
}
