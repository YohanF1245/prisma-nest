import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShareDto } from './dto/create-share.dto';
import { UpdateShareDto } from './dto/update-share.dto';
import { MangopayWalletService } from '../mangopay-wallet/mangopay-wallet.service';

@Injectable()
export class SharesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mangopayWalletService: MangopayWalletService,
  ) {}

  async create(createShareDto: CreateShareDto) {
    const { userId, contractId, quantity } = createShareDto;

    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    // Vérifier si le contrat existe
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException(`Contrat avec l'ID ${contractId} non trouvé`);
    }

    // Calculer le coût total de l'achat
    const costPerShare = contract.totalValue / 100; // Supposons que le contrat a 100 parts au total
    const totalCost = costPerShare * quantity;

    // Vérifier si l'utilisateur a suffisamment de fonds
    const hasFunds = await this.mangopayWalletService.hasSufficientFunds(userId, totalCost);
    if (!hasFunds) {
      throw new BadRequestException(`L'utilisateur n'a pas suffisamment de fonds pour acheter ${quantity} parts`);
    }

    // Vérifier si l'utilisateur a déjà des parts pour ce contrat
    const existingShare = await this.prisma.share.findUnique({
      where: {
        userId_contractId: {
          userId,
          contractId,
        },
      },
    });

    // Si l'utilisateur a déjà des parts, mettre à jour la quantité
    if (existingShare) {
      return this.prisma.share.update({
        where: { id: existingShare.id },
        data: { quantity: existingShare.quantity + quantity },
      });
    }

    // Sinon, créer une nouvelle entrée
    return this.prisma.share.create({
      data: createShareDto,
    });
  }

  async findAll() {
    return this.prisma.share.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        contract: {
          select: {
            id: true,
            rightPercentage: true,
            totalValue: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    const shares = await this.prisma.share.findMany({
      where: { userId },
      include: {
        contract: true,
      },
    });

    if (shares.length === 0) {
      throw new NotFoundException(`Aucune part trouvée pour l'utilisateur avec l'ID ${userId}`);
    }

    return shares;
  }

  async findByContractId(contractId: string) {
    const shares = await this.prisma.share.findMany({
      where: { contractId },
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
    });

    if (shares.length === 0) {
      throw new NotFoundException(`Aucune part trouvée pour le contrat avec l'ID ${contractId}`);
    }

    return shares;
  }

  async findOne(id: string) {
    const share = await this.prisma.share.findUnique({
      where: { id },
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

    if (!share) {
      throw new NotFoundException(`Part avec l'ID ${id} non trouvée`);
    }

    return share;
  }

  async update(id: string, updateShareDto: UpdateShareDto) {
    // Vérifier si la part existe
    await this.findOne(id);

    // Mettre à jour la part
    return this.prisma.share.update({
      where: { id },
      data: updateShareDto,
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

  async remove(id: string) {
    // Vérifier si la part existe
    await this.findOne(id);

    // Suppression de la part
    await this.prisma.share.delete({
      where: { id },
    });

    return { id, message: 'Part supprimée avec succès' };
  }
} 