import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { MangopayWalletService } from '../mangopay-wallet/mangopay-wallet.service';
import { PriceMedianHistoryService } from '../price-median-history/price-median-history.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mangopayWalletService: MangopayWalletService,
    private readonly priceMedianHistoryService: PriceMedianHistoryService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { buyerId, sellerId, shareId, price } = createTransactionDto;

    // Vérifier si les utilisateurs existent
    const buyer = await this.prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) {
      throw new NotFoundException(`Acheteur avec l'ID ${buyerId} non trouvé`);
    }

    const seller = await this.prisma.user.findUnique({ where: { id: sellerId } });
    if (!seller) {
      throw new NotFoundException(`Vendeur avec l'ID ${sellerId} non trouvé`);
    }

    // Vérifier que l'acheteur et le vendeur sont différents
    if (buyerId === sellerId) {
      throw new BadRequestException('L\'acheteur et le vendeur ne peuvent pas être la même personne');
    }

    // Vérifier si la part existe et appartient au vendeur
    const share = await this.prisma.share.findUnique({
      where: { id: shareId },
    });

    if (!share) {
      throw new NotFoundException(`Part avec l'ID ${shareId} non trouvée`);
    }

    if (share.userId !== sellerId) {
      throw new BadRequestException('Le vendeur n\'est pas propriétaire de cette part');
    }

    // Vérifier que la part est disponible à la vente (vérifie le contrat associé)
    const contract = await this.prisma.contract.findUnique({
      where: { id: share.contractId },
    });

    if (!contract || !contract.secondaryMarketEnabled) {
      throw new BadRequestException('Cette part n\'est pas disponible pour la vente sur le marché secondaire');
    }

    // Vérifier si l'acheteur a suffisamment de fonds
    const hasFunds = await this.mangopayWalletService.hasSufficientFunds(buyerId, price);
    if (!hasFunds) {
      throw new BadRequestException(`L'acheteur n'a pas suffisamment de fonds pour cette transaction`);
    }

    // Effectuer le transfert de fonds entre l'acheteur et le vendeur
    await this.mangopayWalletService.transferFunds(buyerId, sellerId, price);

    // Créer la transaction
    const newTransaction = await this.prisma.transaction.create({
      data: createTransactionDto,
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        share: true,
      },
    });

    // Transférer la propriété de la part au nouvel acheteur
    await this.prisma.share.update({
      where: { id: shareId },
      data: { userId: buyerId },
    });

    // Enregistrer la transaction dans l'historique des prix médians
    await this.priceMedianHistoryService.recordTransaction(shareId, price);

    // Envoyer des notifications aux deux parties
    try {
      // Notification à l'acheteur
      await this.notificationsService.notifyNewSale(buyerId, newTransaction.id, true);
      
      // Notification au vendeur
      await this.notificationsService.notifyNewSale(sellerId, newTransaction.id, true);
    } catch (error) {
      // Ne pas bloquer la transaction si l'envoi de notification échoue
      console.error('Erreur lors de l\'envoi des notifications:', error);
    }

    return newTransaction;
  }

  async findAll() {
    return this.prisma.transaction.findMany({
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        share: true,
      },
    });
  }

  async findByBuyerId(buyerId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { buyerId },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        share: true,
      },
    });

    if (transactions.length === 0) {
      throw new NotFoundException(`Aucune transaction trouvée pour l'acheteur avec l'ID ${buyerId}`);
    }

    return transactions;
  }

  async findBySellerId(sellerId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { sellerId },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        share: true,
      },
    });

    if (transactions.length === 0) {
      throw new NotFoundException(`Aucune transaction trouvée pour le vendeur avec l'ID ${sellerId}`);
    }

    return transactions;
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        share: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction avec l'ID ${id} non trouvée`);
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    // Vérifier si la transaction existe
    await this.findOne(id);

    // Les transactions ne devraient généralement pas être modifiables
    // après leur création, mais cela dépend de vos besoins spécifiques
    return this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        share: true,
      },
    });
  }

  async remove(id: string) {
    // Vérifier si la transaction existe
    await this.findOne(id);

    // Suppression de la transaction
    // Note : Normalement, les transactions ne devraient pas être supprimées
    // pour des raisons d'audit, mais plutôt marquées comme annulées
    await this.prisma.transaction.delete({
      where: { id },
    });

    return { id, message: 'Transaction supprimée avec succès' };
  }
} 