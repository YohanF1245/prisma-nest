import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateArtistDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z0-9-]{7,11}$/, {
    message: 'Le numéro IPI doit être au format valide (ex: I-000000123-7)'
  })
  ipiNumber: string;
} 