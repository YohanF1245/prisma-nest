import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { EmailVerificationModule } from './email-verification/email-verification.module';
import { RegistrationModule } from './registration/registration.module';
import { RolesModule } from './roles/roles.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requêtes par minute
      },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    ConfigModule,
    PasswordResetModule,
    EmailVerificationModule,
    RegistrationModule,
    RolesModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
