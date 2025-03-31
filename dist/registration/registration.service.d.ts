import { UsersService } from '../users/users.service';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MangopayInfoService } from '../mangopay-info/mangopay-info.service';
export declare class RegistrationService {
    private usersService;
    private emailVerificationService;
    private mangopayInfoService;
    private readonly logger;
    constructor(usersService: UsersService, emailVerificationService: EmailVerificationService, mangopayInfoService: MangopayInfoService);
    register(createUserDto: CreateUserDto): Promise<{
        message: string;
        userId: string;
    }>;
}
