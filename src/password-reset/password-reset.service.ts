import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { MailConfigService } from '../config/mail-config.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PasswordResetService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private mailConfigService: MailConfigService,
    private mailService: MailService,
  ) {}

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Pour des raisons de sécurité, ne pas révéler que l'utilisateur n'existe pas
      return { message: 'Si un compte avec cet email existe, un email de réinitialisation sera envoyé.' };
    }

    // Génération d'un token unique
    const token = uuidv4();
    
    // Calcul de la date d'expiration
    const expiresIn = this.mailConfigService.resetPasswordTokenExpiration;
    const hours = parseInt(expiresIn);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    // Enregistrement du token dans la base de données
    await this.prisma.resetPassLink.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    // Envoi de l'email de réinitialisation
    await this.mailService.sendPasswordResetEmail(
      email,
      user.firstName || user.email,
      token
    );

    return { message: 'Si un compte avec cet email existe, un email de réinitialisation sera envoyé.' };
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    // Recherche du token de réinitialisation
    const resetLink = await this.prisma.resetPassLink.findUnique({
      where: { token },
    });

    // Vérification de la validité du token
    if (!resetLink) {
      throw new NotFoundException('Lien de réinitialisation invalide');
    }

    if (resetLink.isUsed) {
      throw new BadRequestException('Ce lien a déjà été utilisé');
    }

    if (new Date() > resetLink.expiresAt) {
      throw new BadRequestException('Ce lien a expiré');
    }

    // Hachage du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mise à jour du mot de passe
    await this.prisma.user.update({
      where: { id: resetLink.userId },
      data: { password: hashedPassword },
    });

    // Marquer le lien comme utilisé
    await this.prisma.resetPassLink.update({
      where: { id: resetLink.id },
      data: { isUsed: true },
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
} 