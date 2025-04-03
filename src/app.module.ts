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
import { MangopayInfoModule } from './mangopay-info/mangopay-info.module';
import { MangopayWalletModule } from './mangopay-wallet/mangopay-wallet.module';
import { AddressModule } from './address/address.module';
import { MangopayKycModule } from './mangopay-kyc/mangopay-kyc.module';
import { ContractsModule } from './contracts/contracts.module';
import { RightOwnersModule } from './right-owners/right-owners.module';
import { TracksModule } from './tracks/tracks.module';
import { GenresModule } from './genres/genres.module';
import { AlbumsModule } from './albums/albums.module';
import { ArtistsModule } from './artists/artists.module';
import { SharesModule } from './shares/shares.module';
import { TransactionsModule } from './transactions/transactions.module';

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
    MangopayInfoModule,
    MangopayWalletModule,
    AddressModule,
    MangopayKycModule,
    ContractsModule,
    RightOwnersModule,
    TracksModule,
    GenresModule,
    AlbumsModule,
    ArtistsModule,
    SharesModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
