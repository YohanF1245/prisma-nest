import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceMedianHistoryDto } from './dto/create-price-median-history.dto';
import { UpdatePriceMedianHistoryDto } from './dto/update-price-median-history.dto';
import { PriceVariationResponseDto } from './dto/price-history-response.dto';

interface PriceHistoryRecord {
  id: string;
  shareId: string;
  price: string | number;
  createdAt: Date;
}

@Injectable()
export class PriceMedianHistoryService {
  private readonly logger = new Logger(PriceMedianHistoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée une nouvelle entrée dans l'historique des prix médians
   */
  async create(createPriceMedianHistoryDto: CreatePriceMedianHistoryDto) {
    const { shareId, price } = createPriceMedianHistoryDto;

    // Vérifier si la part existe
    const share = await this.prisma.share.findUnique({
      where: { id: shareId },
    });

    if (!share) {
      throw new NotFoundException(`Part avec l'ID ${shareId} non trouvée`);
    }

    return this.prisma.priceMedianHistory.create({
      data: {
        shareId,
        price,
      },
    });
  }

  /**
   * Récupère tout l'historique des prix pour une part spécifique
   */
  async findAllByShareId(shareId: string) {
    return this.prisma.priceMedianHistory.findMany({
      where: { shareId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Récupère l'historique des prix pour une part sur une période spécifique
   */
  async findByShareIdAndTimeRange(shareId: string, startDate: Date, endDate: Date) {
    return this.prisma.priceMedianHistory.findMany({
      where: {
        shareId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Calcule et ajoute le prix médian pour une part lors d'une transaction
   */
  async recordTransaction(shareId: string, transactionPrice: number) {
    try {
      // Récupérer l'historique des prix pour calculer le nouveau prix médian
      const priceHistory = await this.findAllByShareId(shareId);
      
      // Calculer le prix médian (moyenne simple pour l'instant)
      // On pourrait implémenter un algorithme plus sophistiqué selon les besoins
      let newMedianPrice = transactionPrice;
      
      if (priceHistory.length > 0) {
        const totalPrice = priceHistory.reduce((sum, entry) => sum + Number(entry.price), 0) + transactionPrice;
        newMedianPrice = totalPrice / (priceHistory.length + 1);
      }
      
      // Créer une nouvelle entrée avec le prix médian calculé
      return this.create({
        shareId,
        price: newMedianPrice,
      });
    } catch (error) {
      this.logger.error(`Erreur lors de l'enregistrement de la transaction: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Initialise l'historique des prix pour une nouvelle part
   */
  async initializeForShare(shareId: string, initialPrice: number) {
    return this.create({
      shareId,
      price: initialPrice,
    });
  }

  /**
   * Récupère les données pour générer un graphique sur une période spécifique
   */
  async getChartData(shareId: string, period: '24h' | '7d' | '30d' | '1y' | 'all') {
    const now = new Date();
    let startDate: Date;

    // Déterminer la date de début en fonction de la période
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        // Pour 'all', on ne définit pas de date de début
        return this.findAllByShareId(shareId);
    }

    return this.findByShareIdAndTimeRange(shareId, startDate, now);
  }

  /**
   * Calcule la variation de prix sur une période spécifique
   */
  async getPriceVariation(shareId: string, period: '24h' | '7d' | '30d' | '1y' | 'all'): Promise<PriceVariationResponseDto> {
    const chartData = await this.getChartData(shareId, period);
    
    if (chartData.length < 2) {
      return { 
        variation: 0, 
        percentage: 0,
        oldestPrice: 0,
        latestPrice: 0,
        period
      };
    }
    
    const oldestPrice = Number(chartData[0].price);
    const latestPrice = Number(chartData[chartData.length - 1].price);
    const variation = latestPrice - oldestPrice;
    const percentage = (variation / oldestPrice) * 100;
    
    return {
      variation,
      percentage,
      oldestPrice,
      latestPrice,
      period,
    };
  }
} 