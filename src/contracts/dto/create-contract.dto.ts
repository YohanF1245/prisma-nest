import { IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsDate, IsUUID, Min, Max, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// Type pour les utilisateurs associés au contrat
class UserContractDto {
  @IsNotEmpty()
  @IsUUID('4')
  userId: string;

  @IsOptional()
  @IsString()
  role?: string;
}

export class CreateContractDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  duration: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  rightPercentage: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalValue: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  introductionDate?: Date;

  @IsOptional()
  @IsBoolean()
  secondaryMarketEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  rightOwnerIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  trackIds?: string[];

  @IsOptional()
  @IsArray()
  @Type(() => UserContractDto)
  users?: UserContractDto[];
} 