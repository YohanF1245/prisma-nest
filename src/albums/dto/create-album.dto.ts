import { IsNotEmpty, IsString, IsOptional, IsUrl, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAlbumDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  artist: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  releaseDate?: Date;

  @IsOptional()
  @IsUrl()
  coverImage?: string;
} 