import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateKycDocumentDto {
  @IsNotEmpty()
  @IsString()
  mangopayInfoId: string;

  @IsNotEmpty()
  @IsString()
  @IsIn([
    'IDENTITY_PROOF',
    'ADDRESS_PROOF',
    'REGISTRATION_PROOF',
    'ARTICLES_OF_ASSOCIATION',
    'SHAREHOLDER_DECLARATION',
    'COMPANY_STATUTE',
    'OTHER',
  ])
  type: string;

  @IsOptional()
  @IsString()
  fileName?: string;
} 