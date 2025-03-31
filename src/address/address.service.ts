import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);

  constructor(private prisma: PrismaService) {}

  async create(createAddressDto: CreateAddressDto) {
    const { userId, isPrimary, ...rest } = createAddressDto;

    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    // Si l'adresse doit être définie comme primaire, réinitialiser toutes les autres adresses
    if (isPrimary) {
      await this.resetPrimaryAddresses(userId);
    }

    try {
      const address = await this.prisma.address.create({
        data: {
          ...rest,
          isPrimary: isPrimary || false,
          userId,
        },
      });

      return address;
    } catch (error) {
      this.logger.error(`Erreur lors de la création de l'adresse: ${error.message}`, error.stack);
      throw new Error(`Erreur lors de la création de l'adresse: ${error.message}`);
    }
  }

  async findAll() {
    return this.prisma.address.findMany();
  }

  async findAllByUserId(userId: string) {
    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    return this.prisma.address.findMany({
      where: { userId },
      orderBy: {
        isPrimary: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException(`Adresse avec l'ID ${id} non trouvée`);
    }

    return address;
  }

  async update(id: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException(`Adresse avec l'ID ${id} non trouvée`);
    }

    // Si l'adresse doit être définie comme primaire, réinitialiser toutes les autres adresses
    if (updateAddressDto.isPrimary) {
      await this.resetPrimaryAddresses(address.userId);
    }

    try {
      return this.prisma.address.update({
        where: { id },
        data: updateAddressDto,
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'adresse: ${error.message}`, error.stack);
      throw new Error(`Erreur lors de la mise à jour de l'adresse: ${error.message}`);
    }
  }

  async remove(id: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException(`Adresse avec l'ID ${id} non trouvée`);
    }

    try {
      return this.prisma.address.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de l'adresse: ${error.message}`, error.stack);
      throw new Error(`Erreur lors de la suppression de l'adresse: ${error.message}`);
    }
  }

  async setPrimaryAddress(id: string, userId: string) {
    // Vérifier si l'adresse existe et appartient à l'utilisateur
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException(`Adresse avec l'ID ${id} non trouvée`);
    }

    if (address.userId !== userId) {
      throw new ConflictException("L'adresse n'appartient pas à cet utilisateur");
    }

    // Réinitialiser toutes les adresses primaires de l'utilisateur
    await this.resetPrimaryAddresses(userId);

    // Définir cette adresse comme primaire
    return this.prisma.address.update({
      where: { id },
      data: { isPrimary: true },
    });
  }

  async getDefaultShippingAddress(userId: string) {
    // Récupérer l'adresse primaire de livraison
    const address = await this.prisma.address.findFirst({
      where: {
        userId,
        isPrimary: true,
        OR: [
          { addressType: 'SHIPPING' },
          { addressType: 'BOTH' },
        ],
      },
    });

    if (!address) {
      // Si aucune adresse primaire de livraison n'existe, essayer de récupérer n'importe quelle adresse de livraison
      const anyShippingAddress = await this.prisma.address.findFirst({
        where: {
          userId,
          OR: [
            { addressType: 'SHIPPING' },
            { addressType: 'BOTH' },
          ],
        },
      });

      if (!anyShippingAddress) {
        throw new NotFoundException(`Aucune adresse de livraison trouvée pour l'utilisateur ${userId}`);
      }

      return anyShippingAddress;
    }

    return address;
  }

  async getDefaultBillingAddress(userId: string) {
    // Récupérer l'adresse primaire de facturation
    const address = await this.prisma.address.findFirst({
      where: {
        userId,
        isPrimary: true,
        OR: [
          { addressType: 'BILLING' },
          { addressType: 'BOTH' },
        ],
      },
    });

    if (!address) {
      // Si aucune adresse primaire de facturation n'existe, essayer de récupérer n'importe quelle adresse de facturation
      const anyBillingAddress = await this.prisma.address.findFirst({
        where: {
          userId,
          OR: [
            { addressType: 'BILLING' },
            { addressType: 'BOTH' },
          ],
        },
      });

      if (!anyBillingAddress) {
        throw new NotFoundException(`Aucune adresse de facturation trouvée pour l'utilisateur ${userId}`);
      }

      return anyBillingAddress;
    }

    return address;
  }

  private async resetPrimaryAddresses(userId: string) {
    // Réinitialiser toutes les adresses primaires pour cet utilisateur
    await this.prisma.address.updateMany({
      where: {
        userId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  toMangopayFormat(address: any) {
    return {
      AddressLine1: address.addressLine1,
      AddressLine2: address.addressLine2 || null,
      City: address.city,
      Region: address.region || null,
      PostalCode: address.postalCode,
      Country: address.country,
    };
  }
} 