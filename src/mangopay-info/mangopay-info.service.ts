import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMangopayInfoDto } from './dto/create-mangopay-info.dto';
import { MangopayConfigService } from '../config/mangopay-config.service';
import { AddressService } from '../address/address.service';

@Injectable()
export class MangopayInfoService {
  private readonly logger = new Logger(MangopayInfoService.name);

  constructor(
    private prisma: PrismaService,
    private mangopayConfigService: MangopayConfigService,
    private addressService: AddressService,
  ) {}

  async create(createMangopayInfoDto: CreateMangopayInfoDto) {
    const { userId } = createMangopayInfoDto;

    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    // Vérifier si l'utilisateur a déjà des informations Mangopay
    const existingInfo = await this.prisma.mangopayInfo.findUnique({
      where: { userId },
    });

    if (existingInfo) {
      throw new ConflictException(`L'utilisateur avec l'ID ${userId} a déjà des informations Mangopay`);
    }

    try {
      const mangopayApi = this.mangopayConfigService.getMangopayApi();
      
      // Créer l'utilisateur dans Mangopay en fonction du type
      let mangopayUser;
      
      if (createMangopayInfoDto.type === 'NATURAL') {
        mangopayUser = await this.createNaturalUser(mangopayApi, createMangopayInfoDto);
      } else if (createMangopayInfoDto.type === 'LEGAL') {
        mangopayUser = await this.createLegalUser(mangopayApi, createMangopayInfoDto);
      } else {
        throw new Error(`Type d'utilisateur Mangopay non pris en charge: ${createMangopayInfoDto.type}`);
      }

      // Enregistrer les informations Mangopay dans la base de données
      const mangopayInfo = await this.prisma.mangopayInfo.create({
        data: {
          mangopayUserId: mangopayUser.Id,
          userId,
          type: createMangopayInfoDto.type,
          status: 'CREATED',
          kyc: false,
        },
      });

      // Si une adresse est fournie, créer l'adresse dans notre système
      if (createMangopayInfoDto.address) {
        try {
          await this.addressService.create({
            userId,
            addressLine1: createMangopayInfoDto.address.addressLine1,
            addressLine2: createMangopayInfoDto.address.addressLine2,
            city: createMangopayInfoDto.address.city,
            region: createMangopayInfoDto.address.region,
            postalCode: createMangopayInfoDto.address.postalCode,
            country: createMangopayInfoDto.address.country,
            isPrimary: true,
            addressType: 'BOTH',
          });
          this.logger.log(`Adresse créée pour l'utilisateur Mangopay avec l'ID ${userId}`);
        } catch (error) {
          this.logger.error(`Erreur lors de la création de l'adresse: ${error.message}`, error.stack);
          // Ne pas échouer la création de l'utilisateur Mangopay si la création de l'adresse échoue
        }
      }

      return {
        id: mangopayInfo.id,
        mangopayUserId: mangopayInfo.mangopayUserId,
        userId: mangopayInfo.userId,
        type: mangopayInfo.type,
        status: mangopayInfo.status,
        kyc: mangopayInfo.kyc,
        createdAt: mangopayInfo.createdAt,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la création de l'utilisateur Mangopay: ${error.message}`, error.stack);
      throw new Error(`Erreur lors de la création de l'utilisateur Mangopay: ${error.message}`);
    }
  }

  async findAll() {
    return this.prisma.mangopayInfo.findMany();
  }

  async findOne(id: string) {
    const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
      where: { id },
    });

    if (!mangopayInfo) {
      throw new NotFoundException(`Informations Mangopay avec l'ID ${id} non trouvées`);
    }

    return mangopayInfo;
  }

  async findByUserId(userId: string) {
    const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
      where: { userId },
    });

    if (!mangopayInfo) {
      throw new NotFoundException(`Informations Mangopay pour l'utilisateur avec l'ID ${userId} non trouvées`);
    }

    return mangopayInfo;
  }

  async findByMangopayUserId(mangopayUserId: string) {
    const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
      where: { mangopayUserId },
    });

    if (!mangopayInfo) {
      throw new NotFoundException(`Informations Mangopay avec l'ID Mangopay ${mangopayUserId} non trouvées`);
    }

    return mangopayInfo;
  }

  async updateKycStatus(id: string, kyc: boolean) {
    const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
      where: { id },
    });

    if (!mangopayInfo) {
      throw new NotFoundException(`Informations Mangopay avec l'ID ${id} non trouvées`);
    }

    return this.prisma.mangopayInfo.update({
      where: { id },
      data: { kyc },
    });
  }

  async remove(id: string) {
    const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
      where: { id },
    });

    if (!mangopayInfo) {
      throw new NotFoundException(`Informations Mangopay avec l'ID ${id} non trouvées`);
    }

    // Note: Dans une application réelle, vous devriez peut-être désactiver
    // l'utilisateur dans Mangopay plutôt que de supprimer les informations localement

    return this.prisma.mangopayInfo.delete({
      where: { id },
    });
  }

  private async createNaturalUser(mangopayApi: any, dto: CreateMangopayInfoDto) {
    const naturalUser = {
      FirstName: dto.firstName,
      LastName: dto.lastName,
      Email: dto.email,
      Birthday: this.formatBirthday(dto.birthday),
      Nationality: dto.nationality,
      CountryOfResidence: dto.countryOfResidence,
      PersonType: 'NATURAL',
    };

    // Si une adresse est fournie, l'ajouter à l'utilisateur Mangopay
    if (dto.address) {
      try {
        const formattedAddress = this.addressService.toMangopayFormat(dto.address);
        naturalUser['Address'] = formattedAddress;
      } catch (error) {
        this.logger.error(`Erreur lors du formatage de l'adresse pour Mangopay: ${error.message}`, error.stack);
      }
    }

    // Créer l'utilisateur naturel dans Mangopay
    return new Promise((resolve, reject) => {
      mangopayApi.Users.create(naturalUser, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

  private async createLegalUser(mangopayApi: any, dto: CreateMangopayInfoDto) {
    if (!dto.companyInfo || !dto.legalRepresentative) {
      throw new Error('Les informations de l\'entreprise et du représentant légal sont requises pour les utilisateurs légaux');
    }

    const legalUser = {
      Name: dto.companyInfo.name,
      Email: dto.email,
      LegalPersonType: dto.companyInfo.legalPersonType,
      LegalRepresentativeFirstName: dto.legalRepresentative.firstName,
      LegalRepresentativeLastName: dto.legalRepresentative.lastName,
      LegalRepresentativeEmail: dto.legalRepresentative.email,
      LegalRepresentativeBirthday: this.formatBirthday(dto.legalRepresentative.birthday),
      LegalRepresentativeNationality: dto.legalRepresentative.nationality,
      LegalRepresentativeCountryOfResidence: dto.legalRepresentative.countryOfResidence,
      CompanyNumber: dto.companyInfo.registrationNumber,
      PersonType: 'LEGAL',
    };

    // Si une adresse est fournie, l'ajouter à l'utilisateur Mangopay en tant qu'adresse du siège
    if (dto.address) {
      try {
        const formattedAddress = this.addressService.toMangopayFormat(dto.address);
        legalUser['HeadquartersAddress'] = formattedAddress;
      } catch (error) {
        this.logger.error(`Erreur lors du formatage de l'adresse pour Mangopay: ${error.message}`, error.stack);
      }
    }

    // Créer l'utilisateur légal dans Mangopay
    return new Promise((resolve, reject) => {
      mangopayApi.Users.create(legalUser, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

  private formatBirthday(birthday: string): number {
    // Convertir la date au format timestamp Unix
    return Math.floor(new Date(birthday).getTime() / 1000);
  }
} 