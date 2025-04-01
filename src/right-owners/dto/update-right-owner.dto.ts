import { PartialType } from '@nestjs/mapped-types';
import { CreateRightOwnerDto } from './create-right-owner.dto';

export class UpdateRightOwnerDto extends PartialType(CreateRightOwnerDto) {} 