import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRightOwnerDto } from './dto/create-right-owner.dto';
import { UpdateRightOwnerDto } from './dto/update-right-owner.dto';

@Injectable()
export class RightOwnersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRightOwnerDto: CreateRightOwnerDto) {
    try {
      return await this.prisma.rightOwner.create({
        data: createRightOwnerDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Un propriétaire de droits avec ce numéro IPI existe déjà');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.rightOwner.findMany({
      include: {
        contractRightOwners: {
          include: {
            contract: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const rightOwner = await this.prisma.rightOwner.findUnique({
      where: { id },
      include: {
        contractRightOwners: {
          include: {
            contract: true,
          },
        },
      },
    });

    if (!rightOwner) {
      throw new NotFoundException(`Propriétaire de droits avec l'ID ${id} non trouvé`);
    }

    return rightOwner;
  }

  async findByIPI(ipiNumber: string) {
    const rightOwner = await this.prisma.rightOwner.findUnique({
      where: { ipiNumber },
      include: {
        contractRightOwners: {
          include: {
            contract: true,
          },
        },
      },
    });

    if (!rightOwner) {
      throw new NotFoundException(`Propriétaire de droits avec le numéro IPI ${ipiNumber} non trouvé`);
    }

    return rightOwner;
  }

  async update(id: string, updateRightOwnerDto: UpdateRightOwnerDto) {
    // Vérifier si le propriétaire de droits existe
    await this.findOne(id);

    try {
      return await this.prisma.rightOwner.update({
        where: { id },
        data: updateRightOwnerDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Un propriétaire de droits avec ce numéro IPI existe déjà');
      }
      throw error;
    }
  }

  async remove(id: string) {
    // Vérifier si le propriétaire de droits existe
    await this.findOne(id);

    // Suppression du propriétaire de droits
    await this.prisma.rightOwner.delete({
      where: { id },
    });

    return { id, message: 'Propriétaire de droits supprimé avec succès' };
  }

  async getContracts(rightOwnerId: string) {
    // Vérifier si le propriétaire de droits existe
    await this.findOne(rightOwnerId);

    // Récupérer tous les contrats associés à ce propriétaire de droits
    const contractRightOwners = await this.prisma.contractRightOwner.findMany({
      where: { rightOwnerId },
      include: {
        contract: {
          include: {
            contractTracks: {
              include: {
                track: true,
              },
            },
          },
        },
      },
    });

    // Extraire les contrats des relations
    return contractRightOwners.map(cro => cro.contract);
  }
} 