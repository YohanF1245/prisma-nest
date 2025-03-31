import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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
} 