import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';
import { MailConfigService } from '../config/mail-config.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private mailConfigService: MailConfigService,
    private mailService: MailService,
  ) {}

  async sendVerificationEmail(userId: string) {
    const user = await this.usersService.findOne(userId);

    // Génération d'un token unique
    const token = uuidv4();
    
    // Calcul de la date d'expiration
    const expiresIn = this.mailConfigService.emailVerificationTokenExpiration;
    const hours = parseInt(expiresIn);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    // Enregistrement du token dans la base de données
    await this.prisma.verifyMailLink.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    // Envoi de l'email de vérification
    await this.mailService.sendVerificationEmail(
      user.email,
      user.firstName || user.email,
      token
    );

    return { message: 'Email de vérification envoyé' };
  }

  async verifyEmail(token: string) {
    // Recherche du token de vérification
    const verifyLink = await this.prisma.verifyMailLink.findUnique({
      where: { token },
    });

    // Vérification de la validité du token
    if (!verifyLink) {
      throw new NotFoundException('Lien de vérification invalide');
    }

    if (verifyLink.isUsed) {
      throw new BadRequestException('Ce lien a déjà été utilisé');
    }

    if (new Date() > verifyLink.expiresAt) {
      throw new BadRequestException('Ce lien a expiré');
    }

    // Marquer l'email comme vérifié
    await this.usersService.markEmailAsVerified(verifyLink.userId);

    // Marquer le lien comme utilisé
    await this.prisma.verifyMailLink.update({
      where: { id: verifyLink.id },
      data: { isUsed: true },
    });

    return { message: 'Email vérifié avec succès' };
  }
} 