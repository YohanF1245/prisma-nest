import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationType } from './enums/notification-type.enum';
import { QueryNotificationsDto } from './dto/query-notifications.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<any> {
    const { userId, type, title, message, sendEmail, relatedId } = createNotificationDto;

    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true 
      },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    // Créer la notification
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
        emailSent: false,
      },
    });

    // Envoyer un email si demandé
    if (sendEmail) {
      try {
        const userName = user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.email;
        
        const emailSent = await this.mailService.sendNotification(
          user.email,
          userName,
          title,
          message
        );

        // Mettre à jour le statut d'envoi d'email
        if (emailSent) {
          await this.prisma.notification.update({
            where: { id: notification.id },
            data: { emailSent: true },
          });
          notification.emailSent = true;
        }
      } catch (error) {
        this.logger.error(`Erreur lors de l'envoi de l'email de notification: ${error.message}`, error.stack);
      }
    }

    return notification;
  }

  async findAll(userId: string, query?: QueryNotificationsDto) {
    const { isRead, types, search } = query || {};

    // Construire les filtres
    const where: any = { userId };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (types?.length) {
      where.type = { in: types };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification avec l'ID ${id} non trouvée`);
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    await this.findOne(id);

    return this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
    });
  }

  async markAsRead(id: string, isRead: boolean = true) {
    await this.findOne(id);

    return this.prisma.notification.update({
      where: { id },
      data: { 
        isRead,
        ...(isRead ? { readAt: new Date() } : { readAt: null })
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false
      },
      data: { 
        isRead: true,
        readAt: new Date()
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async removeAll(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }

  // Méthodes spécifiques pour créer différents types de notifications

  async notifyNewSale(userId: string, transactionId: string, sendEmail: boolean = false) {
    // Récupérer les informations de la transaction pour personnaliser la notification
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        share: {
          include: {
            contract: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction avec l'ID ${transactionId} non trouvée`);
    }

    const title = 'Nouvelle vente réussie';
    const message = `Votre part pour le contrat "${transaction.share.contract.id}" a été vendue pour ${transaction.price} €.`;

    return this.create({
      userId,
      type: NotificationType.NEW_SALE,
      title,
      message,
      sendEmail,
      relatedId: transactionId,
    });
  }

  async notifyNewContract(userId: string, contractId: string, sendEmail: boolean = false) {
    // Récupérer les informations du contrat pour personnaliser la notification
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException(`Contrat avec l'ID ${contractId} non trouvé`);
    }

    const title = 'Nouveau contrat disponible';
    const message = `Un nouveau contrat d'une valeur de ${contract.totalValue} € est maintenant disponible.`;

    return this.create({
      userId,
      type: NotificationType.NEW_CONTRACT,
      title,
      message,
      sendEmail,
      relatedId: contractId,
    });
  }

  async notifyPaymentReceived(userId: string, reportId: string, sendEmail: boolean = false) {
    // Récupérer les informations du rapport pour personnaliser la notification
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Rapport avec l'ID ${reportId} non trouvé`);
    }

    const title = 'Paiement reçu';
    const message = `Un paiement de ${report.totalIncome} € a été effectué pour la période du ${new Date(report.startDate).toLocaleDateString()} au ${new Date(report.endDate).toLocaleDateString()}.`;

    return this.create({
      userId,
      type: NotificationType.PAYMENT_RECEIVED,
      title,
      message,
      sendEmail,
      relatedId: reportId,
    });
  }

  // Méthode pour obtenir le nombre de notifications non lues
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }
} 