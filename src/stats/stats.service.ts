import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesStatDto } from './dto/create-sales-stat.dto';
import { UpdateSalesStatDto } from './dto/update-sales-stat.dto';
import { StatType } from './enums/stat-type.enum';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createSalesStatDto: CreateSalesStatDto) {
    const { contractId, statType, salesCount } = createSalesStatDto;

    // Vérifier si le contrat existe
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException(`Contrat avec l'ID ${contractId} non trouvé`);
    }

    // Créer la statistique de vente
    return this.prisma.salesStat.create({
      data: {
        statType,
        salesCount,
        contractId,
      },
    });
  }

  async findAll() {
    return this.prisma.salesStat.findMany({
      include: {
        contract: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByContract(contractId: string) {
    // Vérifier si le contrat existe
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException(`Contrat avec l'ID ${contractId} non trouvé`);
    }

    return this.prisma.salesStat.findMany({
      where: {
        contractId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByType(statType: StatType) {
    return this.prisma.salesStat.findMany({
      where: {
        statType,
      },
      include: {
        contract: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const salesStat = await this.prisma.salesStat.findUnique({
      where: { id },
      include: {
        contract: true,
      },
    });

    if (!salesStat) {
      throw new NotFoundException(`Statistique de vente avec l'ID ${id} non trouvée`);
    }

    return salesStat;
  }

  async update(id: string, updateSalesStatDto: UpdateSalesStatDto) {
    // Vérifier si la statistique existe
    await this.findOne(id);
    
    // Mettre à jour la statistique
    return this.prisma.salesStat.update({
      where: { id },
      data: updateSalesStatDto,
    });
  }

  async updateIncome(id: string, income: number) {
    return this.update(id, { income });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calculateDailyStats() {
    this.logger.log('Exécution du calcul quotidien des statistiques de ventes');
    
    try {
      // Récupérer tous les contrats actifs
      const contracts = await this.prisma.contract.findMany({
        where: {
          isActive: true,
        },
      });

      const today = new Date();
      
      for (const contract of contracts) {
        const introDate = new Date(contract.introductionDate);
        
        // Vérifier si c'est le jour de la semaine pour les statistiques hebdomadaires
        // (si le jour de la semaine actuel est le même que celui de l'introduction du contrat)
        if (today.getDay() === introDate.getDay()) {
          await this.calculateWeeklyStats(contract.id);
        }
        
        // Vérifier si c'est le jour du mois pour les statistiques mensuelles
        // (si le jour du mois actuel est le même que celui de l'introduction du contrat)
        // Prend en compte que les mois peuvent avoir de 28 à 31 jours
        const isMonthlyStatDay = this.isMonthlyStatisticsDay(today, introDate);
        if (isMonthlyStatDay) {
          await this.calculateMonthlyStats(contract.id);
        }
      }
      
      this.logger.log('Calcul des statistiques terminé avec succès');
    } catch (error) {
      this.logger.error(`Erreur lors du calcul des statistiques: ${error.message}`, error.stack);
    }
  }

  private async calculateWeeklyStats(contractId: string) {
    try {
      // Calcul de la date de début de la semaine (il y a 7 jours)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      // Compter les transactions de la dernière semaine pour ce contrat
      const salesCount = await this.countTransactionsByPeriod(contractId, startDate);
      
      // Enregistrer les statistiques hebdomadaires
      await this.create({
        contractId,
        statType: StatType.WEEKLY,
        salesCount,
      });
      
      this.logger.log(`Statistiques hebdomadaires enregistrées pour le contrat ${contractId}: ${salesCount} ventes`);
    } catch (error) {
      this.logger.error(`Erreur lors du calcul des statistiques hebdomadaires pour le contrat ${contractId}: ${error.message}`, error.stack);
    }
  }

  private async calculateMonthlyStats(contractId: string) {
    try {
      // Calcul de la date de début du mois (il y a ~30 jours)
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      
      // Compter les transactions du dernier mois pour ce contrat
      const salesCount = await this.countTransactionsByPeriod(contractId, startDate);
      
      // Enregistrer les statistiques mensuelles
      await this.create({
        contractId,
        statType: StatType.MONTHLY,
        salesCount,
      });
      
      this.logger.log(`Statistiques mensuelles enregistrées pour le contrat ${contractId}: ${salesCount} ventes`);
    } catch (error) {
      this.logger.error(`Erreur lors du calcul des statistiques mensuelles pour le contrat ${contractId}: ${error.message}`, error.stack);
    }
  }

  private async countTransactionsByPeriod(contractId: string, startDate: Date): Promise<number> {
    // Compter les transactions pour la période spécifiée
    const transactions = await this.prisma.transaction.count({
      where: {
        share: {
          contractId,
        },
        date: {
          gte: startDate,
        },
      },
    });
    
    return transactions;
  }

  private isMonthlyStatisticsDay(today: Date, introDate: Date): boolean {
    const introDay = introDate.getDate();
    const todayDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    // Cas simple: même jour du mois
    if (todayDay === introDay) {
      return true;
    }
    
    // Cas spécial: le mois actuel a moins de jours que le jour d'introduction
    // Par exemple, si l'introduction était le 30 et nous sommes en février (28/29 jours)
    if (introDay > daysInMonth && todayDay === daysInMonth) {
      return true;
    }
    
    return false;
  }
}
