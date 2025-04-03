import { IsUUID, IsInt, Min } from 'class-validator';

export class CreateShareDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  contractId: string;

  @IsInt()
  @Min(1, { message: 'La quantité doit être au moins 1' })
  quantity: number;
} 