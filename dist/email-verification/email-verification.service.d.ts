import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { MailConfigService } from '../config/mail-config.service';
import { MailService } from '../mail/mail.service';
export declare class EmailVerificationService {
    private prisma;
    private usersService;
    private mailConfigService;
    private mailService;
    constructor(prisma: PrismaService, usersService: UsersService, mailConfigService: MailConfigService, mailService: MailService);
    sendVerificationEmail(userId: string): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
}
