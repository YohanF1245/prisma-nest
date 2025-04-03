import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMangopayWalletDto } from './dto/create-mangopay-wallet.dto';
import { MangopayConfigService } from '../config/mangopay-config.service';
import { MangopayInfoService } from '../mangopay-info/mangopay-info.service';

@Injectable()
export class MangopayWalletService {
  private readonly logger = new Logger(MangopayWalletService.name);

  constructor(
    private prisma: PrismaService,
    private mangopayConfigService: MangopayConfigService,
    private mangopayInfoService: MangopayInfoService,
  ) {}

  async create(createMangopayWalletDto: CreateMangopayWalletDto) {
    const { mangopayInfoId, currency, description } = createMangopayWalletDto;

    // Vérifier si les informations Mangopay existent
    const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
      where: { id: mangopayInfoId },
    });

    if (!mangopayInfo) {
      throw new NotFoundException(`Informations Mangopay avec l'ID ${mangopayInfoId} non trouvées`);
    }

    try {
      const mangopayApi = this.mangopayConfigService.getMangopayApi();
      
      // Créer le portefeuille dans Mangopay
      const walletData = {
        Owners: [mangopayInfo.mangopayUserId],
        Description: description || `Portefeuille ${currency} pour l'utilisateur ${mangopayInfo.mangopayUserId}`,
        Currency: currency,
      };

      const mangopayWallet = await this.createWalletInMangopay(mangopayApi, walletData);

      // Enregistrer le portefeuille dans la base de données
      const wallet = await this.prisma.mangopayWallet.create({
        data: {
          mangopayWalletId: mangopayWallet.Id,
          mangopayInfoId,
          currency,
          status: 'CREATED',
          description: description || `Portefeuille ${currency}`,
        },
      });

      return {
        id: wallet.id,
        mangopayWalletId: wallet.mangopayWalletId,
        mangopayInfoId: wallet.mangopayInfoId,
        currency: wallet.currency,
        balance: wallet.balance,
        status: wallet.status,
        description: wallet.description,
        createdAt: wallet.createdAt,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la création du portefeuille Mangopay: ${error.message}`, error.stack);
      throw new Error(`Erreur lors de la création du portefeuille Mangopay: ${error.message}`);
    }
  }

  async findAll() {
    return this.prisma.mangopayWallet.findMany();
  }

  async findOne(id: string) {
    const wallet = await this.prisma.mangopayWallet.findUnique({
      where: { id },
    });

    if (!wallet) {
      throw new NotFoundException(`Portefeuille Mangopay avec l'ID ${id} non trouvé`);
    }

    return wallet;
  }

  async findByMangopayInfoId(mangopayInfoId: string) {
    return this.prisma.mangopayWallet.findMany({
      where: { mangopayInfoId },
    });
  }

  async findByMangopayWalletId(mangopayWalletId: string) {
    const wallet = await this.prisma.mangopayWallet.findUnique({
      where: { mangopayWalletId },
    });

    if (!wallet) {
      throw new NotFoundException(`Portefeuille Mangopay avec l'ID Mangopay ${mangopayWalletId} non trouvé`);
    }

    return wallet;
  }

  async updateBalance(id: string) {
    const wallet = await this.prisma.mangopayWallet.findUnique({
      where: { id },
      include: {
        mangopayInfo: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException(`Portefeuille Mangopay avec l'ID ${id} non trouvé`);
    }

    try {
      const mangopayApi = this.mangopayConfigService.getMangopayApi();
      
      // Récupérer les informations à jour du portefeuille dans Mangopay
      const mangopayWallet = await this.getWalletFromMangopay(mangopayApi, wallet.mangopayWalletId);

      // Mettre à jour le solde dans la base de données
      return this.prisma.mangopayWallet.update({
        where: { id },
        data: {
          balance: parseFloat(mangopayWallet.Balance.Amount) / 100, // Convertir les centimes en euros
        },
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du solde du portefeuille: ${error.message}`, error.stack);
      throw new Error(`Erreur lors de la mise à jour du solde du portefeuille: ${error.message}`);
    }
  }

  async remove(id: string) {
    const wallet = await this.prisma.mangopayWallet.findUnique({
      where: { id },
    });

    if (!wallet) {
      throw new NotFoundException(`Portefeuille Mangopay avec l'ID ${id} non trouvé`);
    }

    // Note: Dans une application réelle, vous ne pouvez généralement pas supprimer un portefeuille
    // dans Mangopay, mais vous pouvez le désactiver ou le vider.

    return this.prisma.mangopayWallet.delete({
      where: { id },
    });
  }

  private async createWalletInMangopay(mangopayApi: any, walletData: any) {
    return new Promise((resolve, reject) => {
      mangopayApi.Wallets.create(walletData, (err, wallet) => {
        if (err) {
          reject(err);
        } else {
          resolve(wallet);
        }
      });
    });
  }

  private async getWalletFromMangopay(mangopayApi: any, walletId: string) {
    return new Promise((resolve, reject) => {
      mangopayApi.Wallets.get(walletId, (err, wallet) => {
        if (err) {
          reject(err);
        } else {
          resolve(wallet);
        }
      });
    });
  }

  /**
   * Vérifie si un utilisateur a suffisamment de fonds pour un achat
   * @param userId - ID de l'utilisateur
   * @param amount - Montant requis
   * @returns boolean - true si l'utilisateur a suffisamment de fonds
   */
  async hasSufficientFunds(userId: string, amount: number): Promise<boolean> {
    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        mangopayInfo: {
          include: {
            mangopayWallets: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    if (!user.mangopayInfo || !user.mangopayInfo.mangopayWallets || user.mangopayInfo.mangopayWallets.length === 0) {
      return false;
    }

    // Vérifier le solde total de tous les portefeuilles
    const totalBalance = user.mangopayInfo.mangopayWallets.reduce(
      (sum, wallet) => sum + wallet.balance,
      0,
    );

    return totalBalance >= amount;
  }

  /**
   * Effectue un transfert de fonds entre deux utilisateurs
   * @param fromUserId - ID de l'utilisateur source
   * @param toUserId - ID de l'utilisateur destination
   * @param amount - Montant à transférer
   */
  async transferFunds(fromUserId: string, toUserId: string, amount: number): Promise<void> {
    // Vérifier si les utilisateurs existent
    const fromUser = await this.prisma.user.findUnique({
      where: { id: fromUserId },
      include: {
        mangopayInfo: {
          include: {
            mangopayWallets: true,
          },
        },
      },
    });

    if (!fromUser) {
      throw new NotFoundException(`Utilisateur source avec l'ID ${fromUserId} non trouvé`);
    }

    const toUser = await this.prisma.user.findUnique({
      where: { id: toUserId },
      include: {
        mangopayInfo: {
          include: {
            mangopayWallets: true,
          },
        },
      },
    });

    if (!toUser) {
      throw new NotFoundException(`Utilisateur destination avec l'ID ${toUserId} non trouvé`);
    }

    // Vérifier si les utilisateurs ont des portefeuilles
    if (!fromUser.mangopayInfo || !fromUser.mangopayInfo.mangopayWallets || fromUser.mangopayInfo.mangopayWallets.length === 0) {
      throw new BadRequestException(`L'utilisateur source n'a pas de portefeuille configuré`);
    }

    if (!toUser.mangopayInfo || !toUser.mangopayInfo.mangopayWallets || toUser.mangopayInfo.mangopayWallets.length === 0) {
      throw new BadRequestException(`L'utilisateur destination n'a pas de portefeuille configuré`);
    }

    // Vérifier si l'utilisateur source a suffisamment de fonds
    const hasFunds = await this.hasSufficientFunds(fromUserId, amount);
    if (!hasFunds) {
      throw new BadRequestException(`L'utilisateur source n'a pas suffisamment de fonds`);
    }

    // Obtenir le portefeuille principal de chaque utilisateur
    const fromWallet = fromUser.mangopayInfo.mangopayWallets[0];
    const toWallet = toUser.mangopayInfo.mangopayWallets[0];

    // Mettre à jour les soldes
    await this.prisma.mangopayWallet.update({
      where: { id: fromWallet.id },
      data: { balance: fromWallet.balance - amount },
    });

    await this.prisma.mangopayWallet.update({
      where: { id: toWallet.id },
      data: { balance: toWallet.balance + amount },
    });

    // Ici, on pourrait également ajouter la logique pour enregistrer la transaction
    // dans Mangopay si nécessaire
    this.logger.log(`Transfert de ${amount} effectué de ${fromUserId} vers ${toUserId}`);
  }
} 