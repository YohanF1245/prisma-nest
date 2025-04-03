import { Controller, Get, Param, UseGuards, ParseUUIDPipe, Query } from '@nestjs/common';
import { PriceMedianHistoryService } from './price-median-history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';
import { PriceHistoryResponseDto, PriceVariationResponseDto } from './dto/price-history-response.dto';

export enum PricePeriod {
  DAY = '24h',
  WEEK = '7d',
  MONTH = '30d',
  YEAR = '1y',
  ALL = 'all',
}

@Controller('price-median-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PriceMedianHistoryController {
  constructor(private readonly priceMedianHistoryService: PriceMedianHistoryService) {}

  @Get('share/:shareId')
  @Roles('USER', 'ADMIN')
  async findAllByShareId(@Param('shareId', ParseUUIDPipe) shareId: string): Promise<PriceHistoryResponseDto[]> {
    const data = await this.priceMedianHistoryService.findAllByShareId(shareId);
    return data.map(item => ({
      id: item.id,
      shareId: item.shareId,
      price: Number(item.price),
      createdAt: item.createdAt,
    }));
  }

  @Get('share/:shareId/chart/:period')
  @Roles('USER', 'ADMIN')
  async getChartData(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @Param('period') period: PricePeriod,
  ): Promise<PriceHistoryResponseDto[]> {
    const data = await this.priceMedianHistoryService.getChartData(shareId, period as any);
    return data.map(item => ({
      id: item.id,
      shareId: item.shareId,
      price: Number(item.price),
      createdAt: item.createdAt,
    }));
  }

  @Get('share/:shareId/variation/:period')
  @Roles('USER', 'ADMIN')
  async getPriceVariation(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @Param('period') period: PricePeriod,
  ): Promise<PriceVariationResponseDto> {
    return this.priceMedianHistoryService.getPriceVariation(shareId, period as any);
  }
} 