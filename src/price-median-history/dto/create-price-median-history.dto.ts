import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreatePriceMedianHistoryDto {
  @IsUUID()
  shareId: string;

  @IsNumber()
  @Min(0, { message: 'Le prix ne peut pas être négatif' })
  price: number;
} 