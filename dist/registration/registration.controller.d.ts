import { RegistrationService } from './registration.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class RegistrationController {
    private registrationService;
    constructor(registrationService: RegistrationService);
    register(createUserDto: CreateUserDto): Promise<{
        message: string;
        userId: string;
    }>;
}
