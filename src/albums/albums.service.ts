import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Injectable()
export class AlbumsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAlbumDto: CreateAlbumDto) {
    try {
      return await this.prisma.album.create({
        data: createAlbumDto,
      });
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la création de l'album: ${error.message}`);
    }
  }

  async findAll() {
    return this.prisma.album.findMany({
      include: {
        tracks: true,
      },
    });
  }

  async findOne(id: string) {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        tracks: true,
      },
    });

    if (!album) {
      throw new NotFoundException(`Album avec l'ID ${id} non trouvé`);
    }

    return album;
  }

  async findByArtist(artist: string) {
    return this.prisma.album.findMany({
      where: {
        artist: {
          contains: artist,
          mode: 'insensitive', // Recherche insensible à la casse
        },
      },
      include: {
        tracks: true,
      },
    });
  }

  async update(id: string, updateAlbumDto: UpdateAlbumDto) {
    // Vérifier si l'album existe
    await this.findOne(id);

    try {
      return await this.prisma.album.update({
        where: { id },
        data: updateAlbumDto,
        include: {
          tracks: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la mise à jour de l'album: ${error.message}`);
    }
  }

  async remove(id: string) {
    // Vérifier si l'album existe
    await this.findOne(id);

    // Vérifier si des pistes sont associées à cet album
    const tracks = await this.prisma.track.findMany({
      where: { albumId: id },
    });

    if (tracks.length > 0) {
      throw new BadRequestException(`Impossible de supprimer cet album car ${tracks.length} piste(s) y sont associées`);
    }

    // Supprimer l'album
    await this.prisma.album.delete({
      where: { id },
    });

    return { id, message: 'Album supprimé avec succès' };
  }

  async addTrackToAlbum(albumId: string, trackId: string) {
    // Vérifier si l'album existe
    await this.findOne(albumId);

    // Vérifier si la piste existe
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      throw new NotFoundException(`Piste avec l'ID ${trackId} non trouvée`);
    }

    // Associer la piste à l'album
    return this.prisma.track.update({
      where: { id: trackId },
      data: { albumId },
    });
  }

  async removeTrackFromAlbum(albumId: string, trackId: string) {
    // Vérifier si l'album existe
    await this.findOne(albumId);

    // Vérifier si la piste existe et est associée à cet album
    const track = await this.prisma.track.findFirst({
      where: {
        id: trackId,
        albumId,
      },
    });

    if (!track) {
      throw new NotFoundException(`Piste avec l'ID ${trackId} non trouvée dans l'album ${albumId}`);
    }

    // Dissocier la piste de l'album
    return this.prisma.track.update({
      where: { id: trackId },
      data: { albumId: null },
    });
  }
} 