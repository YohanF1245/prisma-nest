import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { UsersModule } from '../users/users.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';

@Module({
  imports: [UsersModule, EmailVerificationModule],
  controllers: [RegistrationController],
  providers: [RegistrationService],
})
export class RegistrationModule {} 