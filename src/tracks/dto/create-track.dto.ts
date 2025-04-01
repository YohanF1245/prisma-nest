import { IsNotEmpty, IsString, IsUrl, IsOptional } from 'class-validator';

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
} 