import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class RegistrationService {
  constructor(
    private usersService: UsersService,
    private emailVerificationService: EmailVerificationService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Créer l'utilisateur
    const result = await this.usersService.create(createUserDto);
    
    // Envoyer un email de vérification
    await this.emailVerificationService.sendVerificationEmail(result.id);
    
    return {
      message: 'Inscription réussie. Un email de vérification a été envoyé.',
      userId: result.id,
    };
  }
} 