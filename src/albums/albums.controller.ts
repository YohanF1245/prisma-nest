import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';

@Controller('albums')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createAlbumDto: CreateAlbumDto) {
    return this.albumsService.create(createAlbumDto);
  }

  @Get()
  @Roles('USER', 'ADMIN')
  findAll(@Query('artist') artist?: string) {
    if (artist) {
      return this.albumsService.findByArtist(artist);
    }
    return this.albumsService.findAll();
  }

  @Get(':id')
  @Roles('USER', 'ADMIN')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.albumsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAlbumDto: UpdateAlbumDto,
  ) {
    return this.albumsService.update(id, updateAlbumDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.albumsService.remove(id);
  }

  @Post(':id/tracks/:trackId')
  @Roles('ADMIN')
  addTrackToAlbum(
    @Param('id', ParseUUIDPipe) albumId: string,
    @Param('trackId', ParseUUIDPipe) trackId: string,
  ) {
    return this.albumsService.addTrackToAlbum(albumId, trackId);
  }

  @Delete(':id/tracks/:trackId')
  @Roles('ADMIN')
  removeTrackFromAlbum(
    @Param('id', ParseUUIDPipe) albumId: string,
    @Param('trackId', ParseUUIDPipe) trackId: string,
  ) {
    return this.albumsService.removeTrackFromAlbum(albumId, trackId);
  }
} 