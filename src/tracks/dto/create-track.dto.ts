import { IsNotEmpty, IsString, IsUrl, IsOptional, IsUUID } from 'class-validator';

export class CreateTrackDto {
  @IsNotEmpty()
  @IsString()
  trackId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsUrl()
  songImage?: string;

  @IsOptional()
  @IsUUID('4')
  genreId?: string;

  @IsOptional()
  @IsUUID('4')
  albumId?: string;
} 