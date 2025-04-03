import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGenreDto: CreateGenreDto) {
    try {
      return await this.prisma.genre.create({
        data: createGenreDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Un genre avec ce nom existe déjà');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.genre.findMany({
      include: {
        tracks: true,
      },
    });
  }

  async findOne(id: string) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: {
        tracks: true,
      },
    });

    if (!genre) {
      throw new NotFoundException(`Genre avec l'ID ${id} non trouvé`);
    }

    return genre;
  }

  async findByName(name: string) {
    const genre = await this.prisma.genre.findUnique({
      where: { name },
      include: {
        tracks: true,
      },
    });

    if (!genre) {
      throw new NotFoundException(`Genre avec le nom ${name} non trouvé`);
    }

    return genre;
  }

  async update(id: string, updateGenreDto: UpdateGenreDto) {
    // Vérifier si le genre existe
    await this.findOne(id);

    try {
      return await this.prisma.genre.update({
        where: { id },
        data: updateGenreDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Un genre avec ce nom existe déjà');
      }
      throw error;
    }
  }

  async remove(id: string) {
    // Vérifier si le genre existe
    await this.findOne(id);

    // Vérifier si des pistes sont associées à ce genre
    const tracks = await this.prisma.track.findMany({
      where: { genreId: id },
    });

    if (tracks.length > 0) {
      throw new BadRequestException(`Impossible de supprimer ce genre car ${tracks.length} piste(s) y sont associées`);
    }

    // Supprimer le genre
    await this.prisma.genre.delete({
      where: { id },
    });

    return { id, message: 'Genre supprimé avec succès' };
  }
} 