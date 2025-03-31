import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class UploadKycPageDto {
  @IsNotEmpty()
  @IsString()
  kycDocumentId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  pageNumber: number;

  // Le fichier sera géré via FilesInterceptor de NestJS
  // donc nous n'avons pas besoin d'un champ pour le fichier ici
} 