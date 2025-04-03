import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  buyerId: string;

  @IsUUID()
  sellerId: string;

  @IsUUID()
  shareId: string;

  @IsNumber()
  @Min(0.01, { message: 'Le prix doit être supérieur à 0' })
  price: number;
} 