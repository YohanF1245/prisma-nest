import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';

@Injectable()
export class TracksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTrackDto: CreateTrackDto) {
    try {
      return await this.prisma.track.create({
        data: createTrackDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Une piste avec cet identifiant externe existe déjà');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.track.findMany({
      include: {
        contractTracks: {
          include: {
            contract: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const track = await this.prisma.track.findUnique({
      where: { id },
      include: {
        contractTracks: {
          include: {
            contract: true,
          },
        },
      },
    });

    if (!track) {
      throw new NotFoundException(`Piste avec l'ID ${id} non trouvée`);
    }

    return track;
  }

  async findByTrackId(trackId: string) {
    const track = await this.prisma.track.findUnique({
      where: { trackId },
      include: {
        contractTracks: {
          include: {
            contract: true,
          },
        },
      },
    });

    if (!track) {
      throw new NotFoundException(`Piste avec l'identifiant externe ${trackId} non trouvée`);
    }

    return track;
  }

  async update(id: string, updateTrackDto: UpdateTrackDto) {
    // Vérifier si la piste existe
    await this.findOne(id);

    try {
      return await this.prisma.track.update({
        where: { id },
        data: updateTrackDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Une piste avec cet identifiant externe existe déjà');
      }
      throw error;
    }
  }

  async remove(id: string) {
    // Vérifier si la piste existe
    await this.findOne(id);

    // Suppression de la piste
    await this.prisma.track.delete({
      where: { id },
    });

    return { id, message: 'Piste supprimée avec succès' };
  }

  async getContracts(trackId: string) {
    // Vérifier si la piste existe
    await this.findOne(trackId);

    // Récupérer tous les contrats associés à cette piste
    const contractTracks = await this.prisma.contractTrack.findMany({
      where: { trackId },
      include: {
        contract: {
          include: {
            contractRightOwners: {
              include: {
                rightOwner: true,
              },
            },
          },
        },
      },
    });

    // Extraire les contrats des relations
    return contractTracks.map(ct => ct.contract);
  }
} 