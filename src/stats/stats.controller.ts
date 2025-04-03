import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { StatsService } from './stats.service';
import { CreateSalesStatDto } from './dto/create-sales-stat.dto';
import { StatType } from './enums/stat-type.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createSalesStatDto: CreateSalesStatDto) {
    return this.statsService.create(createSalesStatDto);
  }

  @Get()
  @Roles('ADMIN', 'USER')
  findAll() {
    return this.statsService.findAll();
  }

  @Get('contract/:id')
  @Roles('ADMIN', 'USER')
  findByContract(@Param('id', ParseUUIDPipe) id: string) {
    return this.statsService.findByContract(id);
  }

  @Get('type/:type')
  @Roles('ADMIN', 'USER')
  findByType(@Param('type') type: StatType) {
    return this.statsService.findByType(type);
  }

  // Endpoint pour déclencher manuellement le calcul des statistiques (utile pour les tests)
  @Post('calculate')
  @Roles('ADMIN')
  async calculateStats() {
    await this.statsService.calculateDailyStats();
    return { message: 'Calcul des statistiques déclenché avec succès' };
  }
}
