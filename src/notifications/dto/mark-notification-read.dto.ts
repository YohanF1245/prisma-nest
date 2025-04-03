import { IsBoolean, IsNotEmpty } from 'class-validator';

export class MarkNotificationReadDto {
  @IsBoolean()
  @IsNotEmpty()
  isRead: boolean;
} 