import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateMangopayWalletDto {
  @IsNotEmpty()
  @IsString()
  mangopayInfoId: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['EUR', 'USD', 'GBP', 'CHF', 'NOK', 'SEK', 'DKK', 'PLN', 'CAD'])
  currency: string;

  @IsOptional()
  @IsString()
  description?: string;
} 