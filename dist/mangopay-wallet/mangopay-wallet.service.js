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
var MangopayWalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangopayWalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mangopay_config_service_1 = require("../config/mangopay-config.service");
const mangopay_info_service_1 = require("../mangopay-info/mangopay-info.service");
let MangopayWalletService = MangopayWalletService_1 = class MangopayWalletService {
    prisma;
    mangopayConfigService;
    mangopayInfoService;
    logger = new common_1.Logger(MangopayWalletService_1.name);
    constructor(prisma, mangopayConfigService, mangopayInfoService) {
        this.prisma = prisma;
        this.mangopayConfigService = mangopayConfigService;
        this.mangopayInfoService = mangopayInfoService;
    }
    async create(createMangopayWalletDto) {
        const { mangopayInfoId, currency, description } = createMangopayWalletDto;
        const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
            where: { id: mangopayInfoId },
        });
        if (!mangopayInfo) {
            throw new common_1.NotFoundException(`Informations Mangopay avec l'ID ${mangopayInfoId} non trouvées`);
        }
        try {
            const mangopayApi = this.mangopayConfigService.getMangopayApi();
            const walletData = {
                Owners: [mangopayInfo.mangopayUserId],
                Description: description || `Portefeuille ${currency} pour l'utilisateur ${mangopayInfo.mangopayUserId}`,
                Currency: currency,
            };
            const mangopayWallet = await this.createWalletInMangopay(mangopayApi, walletData);
            const wallet = await this.prisma.mangopayWallet.create({
                data: {
                    mangopayWalletId: mangopayWallet.Id,
                    mangopayInfoId,
                    currency,
                    status: 'CREATED',
                    description: description || `Portefeuille ${currency}`,
                },
            });
            return {
                id: wallet.id,
                mangopayWalletId: wallet.mangopayWalletId,
                mangopayInfoId: wallet.mangopayInfoId,
                currency: wallet.currency,
                balance: wallet.balance,
                status: wallet.status,
                description: wallet.description,
                createdAt: wallet.createdAt,
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors de la création du portefeuille Mangopay: ${error.message}`, error.stack);
            throw new Error(`Erreur lors de la création du portefeuille Mangopay: ${error.message}`);
        }
    }
    async findAll() {
        return this.prisma.mangopayWallet.findMany();
    }
    async findOne(id) {
        const wallet = await this.prisma.mangopayWallet.findUnique({
            where: { id },
        });
        if (!wallet) {
            throw new common_1.NotFoundException(`Portefeuille Mangopay avec l'ID ${id} non trouvé`);
        }
        return wallet;
    }
    async findByMangopayInfoId(mangopayInfoId) {
        return this.prisma.mangopayWallet.findMany({
            where: { mangopayInfoId },
        });
    }
    async findByMangopayWalletId(mangopayWalletId) {
        const wallet = await this.prisma.mangopayWallet.findUnique({
            where: { mangopayWalletId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException(`Portefeuille Mangopay avec l'ID Mangopay ${mangopayWalletId} non trouvé`);
        }
        return wallet;
    }
    async updateBalance(id) {
        const wallet = await this.prisma.mangopayWallet.findUnique({
            where: { id },
            include: {
                mangopayInfo: true,
            },
        });
        if (!wallet) {
            throw new common_1.NotFoundException(`Portefeuille Mangopay avec l'ID ${id} non trouvé`);
        }
        try {
            const mangopayApi = this.mangopayConfigService.getMangopayApi();
            const mangopayWallet = await this.getWalletFromMangopay(mangopayApi, wallet.mangopayWalletId);
            return this.prisma.mangopayWallet.update({
                where: { id },
                data: {
                    balance: parseFloat(mangopayWallet.Balance.Amount) / 100,
                },
            });
        }
        catch (error) {
            this.logger.error(`Erreur lors de la mise à jour du solde du portefeuille: ${error.message}`, error.stack);
            throw new Error(`Erreur lors de la mise à jour du solde du portefeuille: ${error.message}`);
        }
    }
    async remove(id) {
        const wallet = await this.prisma.mangopayWallet.findUnique({
            where: { id },
        });
        if (!wallet) {
            throw new common_1.NotFoundException(`Portefeuille Mangopay avec l'ID ${id} non trouvé`);
        }
        return this.prisma.mangopayWallet.delete({
            where: { id },
        });
    }
    async createWalletInMangopay(mangopayApi, walletData) {
        return new Promise((resolve, reject) => {
            mangopayApi.Wallets.create(walletData, (err, wallet) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(wallet);
                }
            });
        });
    }
    async getWalletFromMangopay(mangopayApi, walletId) {
        return new Promise((resolve, reject) => {
            mangopayApi.Wallets.get(walletId, (err, wallet) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(wallet);
                }
            });
        });
    }
};
exports.MangopayWalletService = MangopayWalletService;
exports.MangopayWalletService = MangopayWalletService = MangopayWalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mangopay_config_service_1.MangopayConfigService,
        mangopay_info_service_1.MangopayInfoService])
], MangopayWalletService);
//# sourceMappingURL=mangopay-wallet.service.js.map