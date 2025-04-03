import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesModule } from '../roles/roles.module';
import { GenresModule } from '../genres/genres.module';
import { AlbumsModule } from '../albums/albums.module';

@Module({
  imports: [PrismaModule, RolesModule, GenresModule, AlbumsModule],
  controllers: [TracksController],
  providers: [TracksService],
  exports: [TracksService],
})
export class TracksModule {} 