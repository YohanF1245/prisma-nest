import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class UpdateStatsIncomeDto {
  @IsUUID()
  @IsNotEmpty()
  salesStatId: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  income: number;
} 