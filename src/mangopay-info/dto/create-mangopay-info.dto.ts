import { IsNotEmpty, IsString, IsIn, IsOptional, IsEmail, IsISO8601, IsObject } from 'class-validator';

export class CreateMangopayInfoDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['NATURAL', 'LEGAL'])
  type: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsISO8601()
  birthday: string;

  @IsNotEmpty()
  @IsString()
  nationality: string;

  @IsNotEmpty()
  @IsString()
  countryOfResidence: string;

  @IsOptional()
  @IsObject()
  address?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region?: string;
    postalCode: string;
    country: string;
  };

  @IsOptional()
  @IsObject()
  legalRepresentative?: {
    firstName: string;
    lastName: string;
    email: string;
    birthday: string;
    nationality: string;
    countryOfResidence: string;
  };

  @IsOptional()
  @IsObject()
  companyInfo?: {
    name: string;
    legalPersonType: string;
    businessType: string;
    registrationNumber: string;
  };
} 