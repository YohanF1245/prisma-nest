import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MangopayInfoService } from '../mangopay-info/mangopay-info.service';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    private usersService: UsersService,
    private emailVerificationService: EmailVerificationService,
    private mangopayInfoService: MangopayInfoService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Créer l'utilisateur
    const result = await this.usersService.create(createUserDto);
    
    // Envoyer un email de vérification
    await this.emailVerificationService.sendVerificationEmail(result.id);
    
    // Créer un utilisateur Mangopay (de type NATURAL)
    try {
      await this.mangopayInfoService.create({
        userId: result.id,
        type: 'NATURAL',
        firstName: createUserDto.firstName || 'Unknown',
        lastName: createUserDto.lastName || 'Unknown',
        email: createUserDto.email,
        birthday: '1990-01-01', // Date par défaut - Dans une véritable application, cela devrait être fourni par l'utilisateur
        nationality: 'FR', // Nationalité par défaut - Dans une véritable application, cela devrait être fourni par l'utilisateur
        countryOfResidence: 'FR', // Pays par défaut - Dans une véritable application, cela devrait être fourni par l'utilisateur
      });
      
      this.logger.log(`Utilisateur Mangopay créé pour l'utilisateur avec l'ID ${result.id}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la création de l'utilisateur Mangopay: ${error.message}`, error.stack);
      // Ne pas échouer l'inscription si la création de l'utilisateur Mangopay échoue
      // Dans une application réelle, vous pourriez vouloir mettre en file d'attente une tâche pour réessayer plus tard
    }
    
    return {
      message: 'Inscription réussie. Un email de vérification a été envoyé.',
      userId: result.id,
    };
  }
} 