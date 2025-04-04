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
} from '@nestjs/common';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';

@Controller('tracks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createTrackDto: CreateTrackDto) {
    return this.tracksService.create(createTrackDto);
  }

  @Get()
  @Roles('USER', 'ADMIN')
  findAll() {
    return this.tracksService.findAll();
  }

  @Get('external/:trackId')
  @Roles('USER', 'ADMIN')
  findByTrackId(@Param('trackId') trackId: string) {
    return this.tracksService.findByTrackId(trackId);
  }

  @Get(':id')
  @Roles('USER', 'ADMIN')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tracksService.findOne(id);
  }

  @Get(':id/contracts')
  @Roles('USER', 'ADMIN')
  getContracts(@Param('id', ParseUUIDPipe) id: string) {
    return this.tracksService.getContracts(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTrackDto: UpdateTrackDto,
  ) {
    return this.tracksService.update(id, updateTrackDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tracksService.remove(id);
  }

  @Patch(':id/genre/:genreId')
  @Roles('ADMIN')
  setGenre(
    @Param('id', ParseUUIDPipe) trackId: string,
    @Param('genreId', ParseUUIDPipe) genreId: string,
  ) {
    return this.tracksService.setGenre(trackId, genreId);
  }

  @Delete(':id/genre')
  @Roles('ADMIN')
  removeGenre(@Param('id', ParseUUIDPipe) trackId: string) {
    return this.tracksService.setGenre(trackId, null);
  }

  @Patch(':id/album/:albumId')
  @Roles('ADMIN')
  setAlbum(
    @Param('id', ParseUUIDPipe) trackId: string,
    @Param('albumId', ParseUUIDPipe) albumId: string,
  ) {
    return this.tracksService.setAlbum(trackId, albumId);
  }

  @Delete(':id/album')
  @Roles('ADMIN')
  removeAlbum(@Param('id', ParseUUIDPipe) trackId: string) {
    return this.tracksService.setAlbum(trackId, null);
  }
} 