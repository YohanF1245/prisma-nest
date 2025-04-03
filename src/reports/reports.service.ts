import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { AddStatsToReportDto } from './dto/add-stats-to-report.dto';
import { UpdateStatsIncomeDto } from './dto/update-stats-income.dto';
import { ReportStatus } from './enums/report-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import * as fs from 'fs';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async create(createReportDto: CreateReportDto) {
    const { title, description, status, startDate, endDate, totalIncome, totalSales, salesStatIds } = createReportDto;

    try {
      // Créer le rapport
      const report = await this.prisma.report.create({
        data: {
          title,
          description,
          status,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          totalIncome: totalIncome || 0,
          totalSales: totalSales || 0,
        },
      });

      // Si des statistiques de ventes sont fournies, les lier au rapport
      if (salesStatIds && salesStatIds.length > 0) {
        await this.addStatsToReport(report.id, { salesStatIds });
      }

      return report;
    } catch (error) {
      this.logger.error(`Erreur lors de la création du rapport: ${error.message}`, error.stack);
      throw new BadRequestException(`Erreur lors de la création du rapport: ${error.message}`);
    }
  }

  async findAll() {
    return this.prisma.report.findMany({
      include: {
        reportStats: {
          include: {
            salesStat: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        reportStats: {
          include: {
            salesStat: {
              include: {
                contract: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Rapport avec l'ID ${id} non trouvé`);
    }

    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto) {
    // Vérifier si le rapport existe
    await this.findOne(id);

    const { salesStatIds, ...updateData } = updateReportDto;

    // Mise à jour des données de base du rapport
    const updateValues: any = { ...updateData };
    
    if (updateData.startDate) {
      updateValues.startDate = new Date(updateData.startDate);
    }
    
    if (updateData.endDate) {
      updateValues.endDate = new Date(updateData.endDate);
    }

    // Mettre à jour le rapport
    const updatedReport = await this.prisma.report.update({
      where: { id },
      data: updateValues,
    });

    // Si des statistiques de ventes sont fournies, mettre à jour les liens
    if (salesStatIds) {
      // Supprimer les liens existants
      await this.prisma.reportStat.deleteMany({
        where: { reportId: id },
      });

      // Ajouter les nouveaux liens
      await this.addStatsToReport(id, { salesStatIds });
      
      // Recalculer les totaux
      await this.recalculateReportTotals(id);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    // Vérifier si le rapport existe
    await this.findOne(id);

    // Supprimer les liens avec les statistiques de ventes
    await this.prisma.reportStat.deleteMany({
      where: { reportId: id },
    });

    // Supprimer le rapport
    return this.prisma.report.delete({
      where: { id },
    });
  }

  async addStatsToReport(reportId: string, addStatsDto: AddStatsToReportDto) {
    const { salesStatIds } = addStatsDto;

    // Vérifier si le rapport existe
    await this.findOne(reportId);

    // Vérifier si les statistiques existent
    for (const statId of salesStatIds) {
      const stat = await this.prisma.salesStat.findUnique({
        where: { id: statId },
      });

      if (!stat) {
        throw new NotFoundException(`Statistique de vente avec l'ID ${statId} non trouvée`);
      }
    }

    // Ajouter les statistiques au rapport
    const reportStats = [];
    for (const statId of salesStatIds) {
      // Vérifier si la relation existe déjà
      const existingRelation = await this.prisma.reportStat.findFirst({
        where: {
          reportId,
          salesStatId: statId,
        },
      });

      if (!existingRelation) {
        const relation = await this.prisma.reportStat.create({
          data: {
            reportId,
            salesStatId: statId,
          },
        });
        reportStats.push(relation);
      }
    }

    // Recalculer les totaux du rapport
    await this.recalculateReportTotals(reportId);

    return reportStats;
  }

  async updateSalesStatIncome(updateIncomeDto: UpdateStatsIncomeDto) {
    const { salesStatId, income } = updateIncomeDto;

    // Vérifier si la statistique existe
    const stat = await this.prisma.salesStat.findUnique({
      where: { id: salesStatId },
    });

    if (!stat) {
      throw new NotFoundException(`Statistique de vente avec l'ID ${salesStatId} non trouvée`);
    }

    // Mettre à jour le revenu de la statistique
    const updatedStat = await this.prisma.salesStat.update({
      where: { id: salesStatId },
      data: { income },
    });

    // Mettre à jour les totaux des rapports associés
    const affectedReports = await this.prisma.reportStat.findMany({
      where: { salesStatId },
      select: { reportId: true },
    });

    for (const { reportId } of affectedReports) {
      await this.recalculateReportTotals(reportId);
    }

    return updatedStat;
  }

  async updateReportStatus(id: string, status: ReportStatus) {
    // Vérifier si le rapport existe
    const report = await this.findOne(id);
    const previousStatus = report.status;

    // Mettre à jour le statut
    const updatedReport = await this.prisma.report.update({
      where: { id },
      data: { status },
    });

    // Si le statut passe de RECEIVED à PAID, envoi de notifications
    if (previousStatus === ReportStatus.RECEIVED && status === ReportStatus.PAID) {
      try {
        // Trouver tous les utilisateurs concernés par les statistiques du rapport
        const reportStats = await this.prisma.reportStat.findMany({
          where: { reportId: id },
          include: {
            salesStat: {
              include: {
                contract: {
                  include: {
                    userContracts: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // Collecter tous les utilisateurs uniques concernés
        const userIds = new Set<string>();
        
        for (const reportStat of reportStats) {
          const contract = reportStat.salesStat.contract;
          
          if (contract.userContracts) {
            for (const userContract of contract.userContracts) {
              userIds.add(userContract.user.id);
            }
          }
        }

        // Envoyer des notifications à tous les utilisateurs concernés
        for (const userId of userIds) {
          await this.notificationsService.notifyPaymentReceived(
            userId,
            id,
            true // Envoyer également un email
          );
        }
      } catch (error) {
        this.logger.error(`Erreur lors de l'envoi des notifications de paiement: ${error.message}`, error.stack);
      }
    }

    return updatedReport;
  }

  async generatePdf(id: string): Promise<string> {
    // Récupérer les informations du rapport
    const report = await this.findOne(id);

    // Créer le dossier pour stocker les PDFs s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), 'uploads', 'reports');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Nom du fichier PDF
    const fileName = `report-${id}-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    // Créer le document PDF
    const doc = new PDFDocument({ margin: 50 });

    // Écrire dans un fichier
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // En-tête du rapport
    doc.fontSize(25).text('Rapport de Ventes', { align: 'center' });
    doc.moveDown();
    doc.fontSize(15).text(`Titre: ${report.title}`, { align: 'left' });
    
    if (report.description) {
      doc.fontSize(12).text(`Description: ${report.description}`, { align: 'left' });
    }
    
    doc.moveDown();
    doc.fontSize(12).text(`Période: du ${new Date(report.startDate).toLocaleDateString()} au ${new Date(report.endDate).toLocaleDateString()}`, { align: 'left' });
    doc.fontSize(12).text(`Statut: ${report.status}`, { align: 'left' });
    doc.fontSize(12).text(`Ventes totales: ${report.totalSales}`, { align: 'left' });
    doc.fontSize(12).text(`Revenus totaux: ${report.totalIncome.toFixed(2)} €`, { align: 'left' });
    doc.moveDown();

    // Détails des statistiques
    doc.fontSize(18).text('Détails des Statistiques', { align: 'left' });
    doc.moveDown();

    // Tableau des statistiques
    const stats = report.reportStats.map(rs => rs.salesStat);
    if (stats.length > 0) {
      // En-tête du tableau
      const tableTop = doc.y;
      const tableHeaders = ['Date', 'Type', 'Contrat', 'Ventes', 'Revenus'];
      const colWidths = [100, 80, 150, 100, 100];
      
      let x = 50;
      for (let i = 0; i < tableHeaders.length; i++) {
        doc.font('Helvetica-Bold').fontSize(12)
           .text(tableHeaders[i], x, tableTop, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      }

      doc.moveDown();
      let y = doc.y;

      // Données du tableau
      for (const stat of stats) {
        x = 50;
        
        doc.font('Helvetica').fontSize(10)
           .text(new Date(stat.createdAt).toLocaleDateString(), x, y, { width: colWidths[0], align: 'left' });
        x += colWidths[0];
        
        doc.text(stat.statType, x, y, { width: colWidths[1], align: 'left' });
        x += colWidths[1];
        
        doc.text(stat.contract ? `ID: ${stat.contract.id.substr(0, 8)}...` : 'N/A', x, y, { width: colWidths[2], align: 'left' });
        x += colWidths[2];
        
        doc.text(stat.salesCount.toString(), x, y, { width: colWidths[3], align: 'left' });
        x += colWidths[3];
        
        doc.text(`${stat.income.toFixed(2)} €`, x, y, { width: colWidths[4], align: 'left' });
        
        y += 20;
        
        // Vérifier si nous avons besoin d'une nouvelle page
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }
      }
    } else {
      doc.fontSize(12).text('Aucune statistique associée à ce rapport.', { align: 'center' });
    }

    // Informations en pied de page
    doc.moveDown(2);
    doc.fontSize(10).text(`Rapport généré le ${new Date().toLocaleString()}`, { align: 'center' });

    // Finaliser le document
    doc.end();

    // Attendre que l'écriture soit terminée
    await new Promise<void>((resolve) => {
      stream.on('finish', () => {
        resolve();
      });
    });

    // Mettre à jour l'URL du PDF dans la base de données
    const pdfUrl = `/uploads/reports/${fileName}`;
    await this.prisma.report.update({
      where: { id },
      data: { pdfUrl },
    });

    return pdfUrl;
  }

  private async recalculateReportTotals(reportId: string) {
    // Récupérer toutes les statistiques associées au rapport
    const reportStats = await this.prisma.reportStat.findMany({
      where: { reportId },
      include: {
        salesStat: true,
      },
    });

    // Calculer les totaux
    let totalSales = 0;
    let totalIncome = 0;

    for (const reportStat of reportStats) {
      totalSales += reportStat.salesStat.salesCount;
      totalIncome += reportStat.salesStat.income;
    }

    // Mettre à jour le rapport avec les nouveaux totaux
    return this.prisma.report.update({
      where: { id: reportId },
      data: {
        totalSales,
        totalIncome,
      },
    });
  }
}
