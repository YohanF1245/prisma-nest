import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { CreateSalesStatDto } from './create-sales-stat.dto';

export class UpdateSalesStatDto extends PartialType(CreateSalesStatDto) {
  @IsNumber()
  @Min(0)
  @IsOptional()
  income?: number;
} 