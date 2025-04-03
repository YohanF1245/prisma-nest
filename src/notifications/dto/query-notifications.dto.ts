import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { NotificationType } from '../enums/notification-type.enum';

export class QueryNotificationsDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isRead?: boolean;

  @IsEnum(NotificationType, { each: true })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  types?: NotificationType[];

  @IsString()
  @IsOptional()
  search?: string;
} 