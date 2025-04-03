import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AddStatsToReportDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  salesStatIds: string[];
} 