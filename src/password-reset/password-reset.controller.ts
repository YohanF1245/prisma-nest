import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';

@Controller('password-reset')
export class PasswordResetController {
  constructor(private passwordResetService: PasswordResetService) {}

  @Post('request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() requestDto: RequestPasswordResetDto) {
    return this.passwordResetService.requestPasswordReset(requestDto.email);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirmPasswordReset(@Body() confirmDto: ConfirmPasswordResetDto) {
    return this.passwordResetService.confirmPasswordReset(
      confirmDto.token,
      confirmDto.newPassword,
    );
  }
} 