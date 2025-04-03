import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ReportStatus } from '../enums/report-status.enum';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ReportStatus)
  @IsNotEmpty()
  status: ReportStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalIncome?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalSales?: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  salesStatIds?: string[];
} 