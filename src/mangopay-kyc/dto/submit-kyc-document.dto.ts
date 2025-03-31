import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitKycDocumentDto {
  @IsNotEmpty()
  @IsString()
  kycDocumentId: string;
} 