import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Injectable()
export class ArtistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createArtistDto: CreateArtistDto) {
    try {
      return await this.prisma.artist.create({
        data: createArtistDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Un artiste avec ce numéro IPI existe déjà');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.artist.findMany();
  }

  async findOne(id: string) {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException(`Artiste avec l'ID ${id} non trouvé`);
    }

    return artist;
  }

  async findByIpi(ipiNumber: string) {
    const artist = await this.prisma.artist.findUnique({
      where: { ipiNumber },
    });

    if (!artist) {
      throw new NotFoundException(`Artiste avec le numéro IPI ${ipiNumber} non trouvé`);
    }

    return artist;
  }

  async update(id: string, updateArtistDto: UpdateArtistDto) {
    // Vérifier si l'artiste existe
    await this.findOne(id);

    try {
      return await this.prisma.artist.update({
        where: { id },
        data: updateArtistDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Un artiste avec ce numéro IPI existe déjà');
      }
      throw error;
    }
  }

  async remove(id: string) {
    // Vérifier si l'artiste existe
    await this.findOne(id);

    // Suppression de l'artiste
    await this.prisma.artist.delete({
      where: { id },
    });

    return { id, message: 'Artiste supprimé avec succès' };
  }
} 