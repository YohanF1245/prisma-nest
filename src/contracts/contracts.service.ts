import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createContractDto: CreateContractDto) {
    const { rightOwnerIds, trackIds, users, ...contractData } = createContractDto;

    // Vérification que le pourcentage est entre 0.01 et 100
    if (contractData.rightPercentage < 0.01 || contractData.rightPercentage > 100) {
      throw new BadRequestException('Le pourcentage de droits doit être compris entre 0.01 et 100');
    }

    try {
      // Créer le contrat avec ses relations
      const contract = await this.prisma.contract.create({
        data: {
          ...contractData,
          // Créer les relations avec les propriétaires de droits si fournis
          ...(rightOwnerIds?.length && {
            contractRightOwners: {
              create: rightOwnerIds.map(rightOwnerId => ({
                rightOwnerId,
              })),
            },
          }),
          // Créer les relations avec les pistes si fournies
          ...(trackIds?.length && {
            contractTracks: {
              create: trackIds.map(trackId => ({
                trackId,
              })),
            },
          }),
          // Créer les relations avec les utilisateurs si fournis
          ...(users?.length && {
            userContracts: {
              create: users.map(user => ({
                userId: user.userId,
                role: user.role || 'OWNER',
              })),
            },
          }),
        },
        include: {
          contractRightOwners: {
            include: {
              rightOwner: true,
            },
          },
          contractTracks: {
            include: {
              track: true,
            },
          },
          userContracts: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      return contract;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Un contrat avec ces informations existe déjà');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Une des entités référencées n\'existe pas');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.contract.findMany({
      include: {
        contractRightOwners: {
          include: {
            rightOwner: true,
          },
        },
        contractTracks: {
          include: {
            track: true,
          },
        },
        userContracts: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        contractRightOwners: {
          include: {
            rightOwner: true,
          },
        },
        contractTracks: {
          include: {
            track: true,
          },
        },
        userContracts: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contrat avec l'ID ${id} non trouvé`);
    }

    return contract;
  }

  async update(id: string, updateContractDto: UpdateContractDto) {
    const { rightOwnerIds, trackIds, users, ...contractData } = updateContractDto;

    // Vérifier si le contrat existe
    await this.findOne(id);

    try {
      // Mettre à jour le contrat et ses relations
      const updatedContract = await this.prisma.$transaction(async (prisma) => {
        // Mettre à jour les données de base du contrat
        const contract = await prisma.contract.update({
          where: { id },
          data: contractData,
        });

        // Si de nouveaux propriétaires de droits sont fournis, mettre à jour les relations
        if (rightOwnerIds) {
          // Supprimer les relations existantes
          await prisma.contractRightOwner.deleteMany({
            where: { contractId: id },
          });

          // Créer les nouvelles relations
          if (rightOwnerIds.length > 0) {
            await prisma.contractRightOwner.createMany({
              data: rightOwnerIds.map(rightOwnerId => ({
                contractId: id,
                rightOwnerId,
              })),
            });
          }
        }

        // Si de nouvelles pistes sont fournies, mettre à jour les relations
        if (trackIds) {
          // Supprimer les relations existantes
          await prisma.contractTrack.deleteMany({
            where: { contractId: id },
          });

          // Créer les nouvelles relations
          if (trackIds.length > 0) {
            await prisma.contractTrack.createMany({
              data: trackIds.map(trackId => ({
                contractId: id,
                trackId,
              })),
            });
          }
        }

        // Si de nouveaux utilisateurs sont fournis, mettre à jour les relations
        if (users) {
          // Supprimer les relations existantes
          await prisma.userContract.deleteMany({
            where: { contractId: id },
          });

          // Créer les nouvelles relations
          if (users.length > 0) {
            await prisma.userContract.createMany({
              data: users.map(user => ({
                contractId: id,
                userId: user.userId,
                role: user.role || 'OWNER',
              })),
            });
          }
        }

        // Retourner le contrat mis à jour avec toutes ses relations
        return prisma.contract.findUnique({
          where: { id },
          include: {
            contractRightOwners: {
              include: {
                rightOwner: true,
              },
            },
            contractTracks: {
              include: {
                track: true,
              },
            },
            userContracts: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        });
      });

      return updatedContract;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Un contrat avec ces informations existe déjà');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Une des entités référencées n\'existe pas');
      }
      throw error;
    }
  }

  async remove(id: string) {
    // Vérifier si le contrat existe
    await this.findOne(id);

    // Supprimer le contrat (les relations seront supprimées automatiquement grâce à onDelete: Cascade)
    await this.prisma.contract.delete({
      where: { id },
    });

    return { id, message: 'Contrat supprimé avec succès' };
  }

  async activateContract(id: string) {
    // Vérifier si le contrat existe
    await this.findOne(id);

    return this.prisma.contract.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivateContract(id: string) {
    // Vérifier si le contrat existe
    await this.findOne(id);

    return this.prisma.contract.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async toggleSecondaryMarket(id: string, enabled: boolean) {
    // Vérifier si le contrat existe
    await this.findOne(id);

    return this.prisma.contract.update({
      where: { id },
      data: { secondaryMarketEnabled: enabled },
    });
  }

  // Nouvelles méthodes pour gérer les utilisateurs associés au contrat
  
  async addUserToContract(contractId: string, userId: string, role: string = 'OWNER') {
    // Vérifier si le contrat existe
    await this.findOne(contractId);

    try {
      return await this.prisma.userContract.create({
        data: {
          contractId,
          userId,
          role,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          contract: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Cet utilisateur est déjà associé à ce contrat');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('L\'utilisateur ou le contrat n\'existe pas');
      }
      throw error;
    }
  }

  async removeUserFromContract(contractId: string, userId: string) {
    // Vérifier si la relation existe
    const userContract = await this.prisma.userContract.findFirst({
      where: { 
        userId,
        contractId
      },
    });

    if (!userContract) {
      throw new NotFoundException(`Relation entre utilisateur ${userId} et contrat ${contractId} non trouvée`);
    }

    // Supprimer la relation
    await this.prisma.userContract.delete({
      where: {
        id: userContract.id
      },
    });

    return { userId, contractId, message: 'Utilisateur retiré du contrat avec succès' };
  }

  async updateUserRole(contractId: string, userId: string, role: string) {
    // Vérifier si la relation existe
    const userContract = await this.prisma.userContract.findFirst({
      where: { 
        userId,
        contractId
      },
    });

    if (!userContract) {
      throw new NotFoundException(`Relation entre utilisateur ${userId} et contrat ${contractId} non trouvée`);
    }

    // Mettre à jour le rôle
    return this.prisma.userContract.update({
      where: {
        id: userContract.id
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        contract: true,
      },
    });
  }

  async getUserContracts(userId: string) {
    return this.prisma.userContract.findMany({
      where: { userId },
      include: {
        contract: {
          include: {
            contractRightOwners: {
              include: {
                rightOwner: true,
              },
            },
            contractTracks: {
              include: {
                track: true,
              },
            },
          },
        },
      },
    });
  }
} 