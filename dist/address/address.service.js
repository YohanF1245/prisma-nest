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
var AddressService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AddressService = AddressService_1 = class AddressService {
    prisma;
    logger = new common_1.Logger(AddressService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAddressDto) {
        const { userId, isPrimary, ...rest } = createAddressDto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
        }
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
        }
        catch (error) {
            this.logger.error(`Erreur lors de la création de l'adresse: ${error.message}`, error.stack);
            throw new Error(`Erreur lors de la création de l'adresse: ${error.message}`);
        }
    }
    async findAll() {
        return this.prisma.address.findMany();
    }
    async findAllByUserId(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
        }
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: {
                isPrimary: 'desc',
            },
        });
    }
    async findOne(id) {
        const address = await this.prisma.address.findUnique({
            where: { id },
        });
        if (!address) {
            throw new common_1.NotFoundException(`Adresse avec l'ID ${id} non trouvée`);
        }
        return address;
    }
    async update(id, updateAddressDto) {
        const address = await this.prisma.address.findUnique({
            where: { id },
        });
        if (!address) {
            throw new common_1.NotFoundException(`Adresse avec l'ID ${id} non trouvée`);
        }
        if (updateAddressDto.isPrimary) {
            await this.resetPrimaryAddresses(address.userId);
        }
        try {
            return this.prisma.address.update({
                where: { id },
                data: updateAddressDto,
            });
        }
        catch (error) {
            this.logger.error(`Erreur lors de la mise à jour de l'adresse: ${error.message}`, error.stack);
            throw new Error(`Erreur lors de la mise à jour de l'adresse: ${error.message}`);
        }
    }
    async remove(id) {
        const address = await this.prisma.address.findUnique({
            where: { id },
        });
        if (!address) {
            throw new common_1.NotFoundException(`Adresse avec l'ID ${id} non trouvée`);
        }
        try {
            return this.prisma.address.delete({
                where: { id },
            });
        }
        catch (error) {
            this.logger.error(`Erreur lors de la suppression de l'adresse: ${error.message}`, error.stack);
            throw new Error(`Erreur lors de la suppression de l'adresse: ${error.message}`);
        }
    }
    async setPrimaryAddress(id, userId) {
        const address = await this.prisma.address.findUnique({
            where: { id },
        });
        if (!address) {
            throw new common_1.NotFoundException(`Adresse avec l'ID ${id} non trouvée`);
        }
        if (address.userId !== userId) {
            throw new common_1.ConflictException("L'adresse n'appartient pas à cet utilisateur");
        }
        await this.resetPrimaryAddresses(userId);
        return this.prisma.address.update({
            where: { id },
            data: { isPrimary: true },
        });
    }
    async getDefaultShippingAddress(userId) {
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
                throw new common_1.NotFoundException(`Aucune adresse de livraison trouvée pour l'utilisateur ${userId}`);
            }
            return anyShippingAddress;
        }
        return address;
    }
    async getDefaultBillingAddress(userId) {
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
                throw new common_1.NotFoundException(`Aucune adresse de facturation trouvée pour l'utilisateur ${userId}`);
            }
            return anyBillingAddress;
        }
        return address;
    }
    async resetPrimaryAddresses(userId) {
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
    toMangopayFormat(address) {
        return {
            AddressLine1: address.addressLine1,
            AddressLine2: address.addressLine2 || null,
            City: address.city,
            Region: address.region || null,
            PostalCode: address.postalCode,
            Country: address.country,
        };
    }
};
exports.AddressService = AddressService;
exports.AddressService = AddressService = AddressService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddressService);
//# sourceMappingURL=address.service.js.map