import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(private emailVerificationService: EmailVerificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendVerificationEmail(@Request() req) {
    return this.emailVerificationService.sendVerificationEmail(req.user.id);
  }

  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.emailVerificationService.verifyEmail(token);
  }
} 