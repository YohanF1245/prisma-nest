import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, Res, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { AddStatsToReportDto } from './dto/add-stats-to-report.dto';
import { UpdateStatsIncomeDto } from './dto/update-stats-income.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';
import { ReportStatus } from './enums/report-status.enum';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Get()
  @Roles('ADMIN', 'USER')
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'USER')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportsService.update(id, updateReportDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.remove(id);
  }

  @Post(':id/stats')
  @Roles('ADMIN')
  addStats(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addStatsDto: AddStatsToReportDto,
  ) {
    return this.reportsService.addStatsToReport(id, addStatsDto);
  }

  @Patch('stats/income')
  @Roles('ADMIN')
  updateStatsIncome(@Body() updateIncomeDto: UpdateStatsIncomeDto) {
    return this.reportsService.updateSalesStatIncome(updateIncomeDto);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ReportStatus,
  ) {
    return this.reportsService.updateReportStatus(id, status);
  }

  @Post(':id/pdf')
  @Roles('ADMIN', 'USER')
  async generatePdf(@Param('id', ParseUUIDPipe) id: string) {
    const pdfUrl = await this.reportsService.generatePdf(id);
    return { pdfUrl };
  }

  @Get(':id/pdf')
  @Roles('ADMIN', 'USER')
  async downloadPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    // Récupérer le rapport pour obtenir l'URL du PDF
    const report = await this.reportsService.findOne(id);
    
    if (!report.pdfUrl) {
      // Générer le PDF s'il n'existe pas
      const pdfUrl = await this.reportsService.generatePdf(id);
      report.pdfUrl = pdfUrl;
    }
    
    // Chemin absolu vers le fichier PDF
    const pdfPath = path.join(process.cwd(), report.pdfUrl.replace(/^\//, ''));
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: 'PDF non trouvé' });
    }
    
    // Définir les en-têtes pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${id}.pdf"`);
    
    // Envoyer le fichier
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
  }
}
