import { Module } from '@nestjs/common';
import { RightOwnersService } from './right-owners.service';
import { RightOwnersController } from './right-owners.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RightOwnersController],
  providers: [RightOwnersService],
  exports: [RightOwnersService],
})
export class RightOwnersModule {} 