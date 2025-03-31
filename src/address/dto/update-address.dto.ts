import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateAddressDto } from './create-address.dto';
import { IsOptional, IsBoolean, IsString, IsIn } from 'class-validator';

export class UpdateAddressDto extends PartialType(
  OmitType(CreateAddressDto, ['userId'] as const),
) {
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['SHIPPING', 'BILLING', 'BOTH'])
  addressType?: string;
} 