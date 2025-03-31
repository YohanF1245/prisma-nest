import { PasswordResetService } from './password-reset.service';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
export declare class PasswordResetController {
    private passwordResetService;
    constructor(passwordResetService: PasswordResetService);
    requestPasswordReset(requestDto: RequestPasswordResetDto): Promise<{
        message: string;
    }>;
    confirmPasswordReset(confirmDto: ConfirmPasswordResetDto): Promise<{
        message: string;
    }>;
}
