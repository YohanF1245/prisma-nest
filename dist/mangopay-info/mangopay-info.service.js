"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MangopayInfoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangopayInfoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mangopay_config_service_1 = require("../config/mangopay-config.service");
const address_service_1 = require("../address/address.service");
let MangopayInfoService = MangopayInfoService_1 = class MangopayInfoService {
    prisma;
    mangopayConfigService;
    addressService;
    logger = new common_1.Logger(MangopayInfoService_1.name);
    constructor(prisma, mangopayConfigService, addressService) {
        this.prisma = prisma;
        this.mangopayConfigService = mangopayConfigService;
        this.addressService = addressService;
    }
    async create(createMangopayInfoDto) {
        const { userId } = createMangopayInfoDto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
        }
        const existingInfo = await this.prisma.mangopayInfo.findUnique({
            where: { userId },
        });
        if (existingInfo) {
            throw new common_1.ConflictException(`L'utilisateur avec l'ID ${userId} a déjà des informations Mangopay`);
        }
        try {
            const mangopayApi = this.mangopayConfigService.getMangopayApi();
            let mangopayUser;
            if (createMangopayInfoDto.type === 'NATURAL') {
                mangopayUser = await this.createNaturalUser(mangopayApi, createMangopayInfoDto);
            }
            else if (createMangopayInfoDto.type === 'LEGAL') {
                mangopayUser = await this.createLegalUser(mangopayApi, createMangopayInfoDto);
            }
            else {
                throw new Error(`Type d'utilisateur Mangopay non pris en charge: ${createMangopayInfoDto.type}`);
            }
            const mangopayInfo = await this.prisma.mangopayInfo.create({
                data: {
                    mangopayUserId: mangopayUser.Id,
                    userId,
                    type: createMangopayInfoDto.type,
                    status: 'CREATED',
                    kyc: false,
                },
            });
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
                }
                catch (error) {
                    this.logger.error(`Erreur lors de la création de l'adresse: ${error.message}`, error.stack);
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
        }
        catch (error) {
            this.logger.error(`Erreur lors de la création de l'utilisateur Mangopay: ${error.message}`, error.stack);
            throw new Error(`Erreur lors de la création de l'utilisateur Mangopay: ${error.message}`);
        }
    }
    async findAll() {
        return this.prisma.mangopayInfo.findMany();
    }
    async findOne(id) {
        const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
            where: { id },
        });
        if (!mangopayInfo) {
            throw new common_1.NotFoundException(`Informations Mangopay avec l'ID ${id} non trouvées`);
        }
        return mangopayInfo;
    }
    async findByUserId(userId) {
        const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
            where: { userId },
        });
        if (!mangopayInfo) {
            throw new common_1.NotFoundException(`Informations Mangopay pour l'utilisateur avec l'ID ${userId} non trouvées`);
        }
        return mangopayInfo;
    }
    async findByMangopayUserId(mangopayUserId) {
        const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
            where: { mangopayUserId },
        });
        if (!mangopayInfo) {
            throw new common_1.NotFoundException(`Informations Mangopay avec l'ID Mangopay ${mangopayUserId} non trouvées`);
        }
        return mangopayInfo;
    }
    async updateKycStatus(id, kyc) {
        const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
            where: { id },
        });
        if (!mangopayInfo) {
            throw new common_1.NotFoundException(`Informations Mangopay avec l'ID ${id} non trouvées`);
        }
        return this.prisma.mangopayInfo.update({
            where: { id },
            data: { kyc },
        });
    }
    async remove(id) {
        const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
            where: { id },
        });
        if (!mangopayInfo) {
            throw new common_1.NotFoundException(`Informations Mangopay avec l'ID ${id} non trouvées`);
        }
        return this.prisma.mangopayInfo.delete({
            where: { id },
        });
    }
    async createNaturalUser(mangopayApi, dto) {
        const naturalUser = {
            FirstName: dto.firstName,
            LastName: dto.lastName,
            Email: dto.email,
            Birthday: this.formatBirthday(dto.birthday),
            Nationality: dto.nationality,
            CountryOfResidence: dto.countryOfResidence,
            PersonType: 'NATURAL',
        };
        if (dto.address) {
            try {
                const formattedAddress = this.addressService.toMangopayFormat(dto.address);
                naturalUser['Address'] = formattedAddress;
            }
            catch (error) {
                this.logger.error(`Erreur lors du formatage de l'adresse pour Mangopay: ${error.message}`, error.stack);
            }
        }
        return new Promise((resolve, reject) => {
            mangopayApi.Users.create(naturalUser, (err, user) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(user);
                }
            });
        });
    }
    async createLegalUser(mangopayApi, dto) {
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
        if (dto.address) {
            try {
                const formattedAddress = this.addressService.toMangopayFormat(dto.address);
                legalUser['HeadquartersAddress'] = formattedAddress;
            }
            catch (error) {
                this.logger.error(`Erreur lors du formatage de l'adresse pour Mangopay: ${error.message}`, error.stack);
            }
        }
        return new Promise((resolve, reject) => {
            mangopayApi.Users.create(legalUser, (err, user) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(user);
                }
            });
        });
    }
    formatBirthday(birthday) {
        return Math.floor(new Date(birthday).getTime() / 1000);
    }
};
exports.MangopayInfoService = MangopayInfoService;
exports.MangopayInfoService = MangopayInfoService = MangopayInfoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mangopay_config_service_1.MangopayConfigService,
        address_service_1.AddressService])
], MangopayInfoService);
//# sourceMappingURL=mangopay-info.service.js.map