import { IsEnum, IsNotEmpty, IsUUID, IsInt } from 'class-validator';
import { StatType } from '../enums/stat-type.enum';

export class CreateSalesStatDto {
  @IsEnum(StatType)
  @IsNotEmpty()
  statType: StatType;

  @IsInt()
  @IsNotEmpty()
  salesCount: number;

  @IsUUID()
  @IsNotEmpty()
  contractId: string;
} 