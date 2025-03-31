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
var MangopayKycService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangopayKycService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mangopay_config_service_1 = require("../config/mangopay-config.service");
const mangopay_info_service_1 = require("../mangopay-info/mangopay-info.service");
const fs = require("fs");
const path = require("path");
const os = require("os");
let MangopayKycService = MangopayKycService_1 = class MangopayKycService {
    prisma;
    mangopayConfigService;
    mangopayInfoService;
    logger = new common_1.Logger(MangopayKycService_1.name);
    tempDir = path.join(os.tmpdir(), 'mangopay-uploads');
    constructor(prisma, mangopayConfigService, mangopayInfoService) {
        this.prisma = prisma;
        this.mangopayConfigService = mangopayConfigService;
        this.mangopayInfoService = mangopayInfoService;
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }
    async createKycDocument(createKycDocumentDto) {
        const { mangopayInfoId, type } = createKycDocumentDto;
        const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
            where: { id: mangopayInfoId },
        });
        if (!mangopayInfo) {
            throw new common_1.NotFoundException(`Informations Mangopay avec l'ID ${mangopayInfoId} non trouvées`);
        }
        try {
            const mangopayApi = this.mangopayConfigService.getMangopayApi();
            const documentData = {
                Type: type,
                UserId: mangopayInfo.mangopayUserId,
            };
            const mangopayDocument = await this.createDocumentInMangopay(mangopayApi, documentData);
            const kycDocument = await this.prisma.kycDocument.create({
                data: {
                    mangopayDocumentId: mangopayDocument.Id,
                    mangopayInfoId,
                    type,
                    status: 'CREATED',
                    fileName: null,
                    fileUrl: null,
                },
            });
            return {
                id: kycDocument.id,
                mangopayDocumentId: kycDocument.mangopayDocumentId,
                mangopayInfoId: kycDocument.mangopayInfoId,
                type: kycDocument.type,
                status: kycDocument.status,
                createdAt: kycDocument.createdAt,
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors de la création du document KYC: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Erreur lors de la création du document KYC: ${error.message}`);
        }
    }
    async uploadKycPage(uploadKycPageDto, file) {
        const { kycDocumentId, pageNumber } = uploadKycPageDto;
        const kycDocument = await this.prisma.kycDocument.findUnique({
            where: { id: kycDocumentId },
            include: {
                mangopayInfo: true,
            },
        });
        if (!kycDocument) {
            throw new common_1.NotFoundException(`Document KYC avec l'ID ${kycDocumentId} non trouvé`);
        }
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier fourni pour l\'upload');
        }
        try {
            const mangopayApi = this.mangopayConfigService.getMangopayApi();
            const tempFileName = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            const filePath = path.join(this.tempDir, tempFileName);
            fs.writeFileSync(filePath, file.buffer);
            const pageData = {
                File: fs.createReadStream(filePath),
                PageNumber: pageNumber,
                UserId: kycDocument.mangopayInfo.mangopayUserId
            };
            const response = await this.createKycPageInMangopay(mangopayApi, kycDocument.mangopayDocumentId, pageData);
            const kycDocumentPage = await this.prisma.kycDocumentPage.create({
                data: {
                    kycDocumentId,
                    mangopayPageId: response && response.Id ? response.Id : null,
                    pageNumber,
                    fileUrl: null,
                },
            });
            await this.prisma.kycDocument.update({
                where: { id: kycDocumentId },
                data: {
                    pages: {
                        increment: 1,
                    },
                },
            });
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                this.logger.log('Fichier temporaire supprimé après upload vers Mangopay');
            }
            return {
                id: kycDocumentPage.id,
                kycDocumentId: kycDocumentPage.kycDocumentId,
                pageNumber: kycDocumentPage.pageNumber,
                createdAt: kycDocumentPage.createdAt,
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors de l'upload de la page KYC: ${error.message}`, error.stack);
            this.cleanupTempFiles();
            throw new common_1.BadRequestException(`Erreur lors de l'upload de la page KYC: ${error.message}`);
        }
    }
    async submitKycDocument(submitKycDocumentDto) {
        const { kycDocumentId } = submitKycDocumentDto;
        const kycDocument = await this.prisma.kycDocument.findUnique({
            where: { id: kycDocumentId },
            include: {
                kycDocumentPages: true,
                mangopayInfo: true,
            },
        });
        if (!kycDocument) {
            throw new common_1.NotFoundException(`Document KYC avec l'ID ${kycDocumentId} non trouvé`);
        }
        if (kycDocument.kycDocumentPages.length === 0) {
            throw new common_1.BadRequestException('Impossible de soumettre un document sans pages');
        }
        try {
            const mangopayApi = this.mangopayConfigService.getMangopayApi();
            await this.submitDocumentInMangopay(mangopayApi, kycDocument.mangopayDocumentId, kycDocument.mangopayInfo.mangopayUserId);
            const updatedKycDocument = await this.prisma.kycDocument.update({
                where: { id: kycDocumentId },
                data: {
                    status: 'VALIDATION_ASKED',
                },
            });
            return {
                id: updatedKycDocument.id,
                mangopayDocumentId: updatedKycDocument.mangopayDocumentId,
                mangopayInfoId: updatedKycDocument.mangopayInfoId,
                type: updatedKycDocument.type,
                status: updatedKycDocument.status,
                pages: updatedKycDocument.pages,
                createdAt: updatedKycDocument.createdAt,
                updatedAt: updatedKycDocument.updatedAt,
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors de la soumission du document KYC: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Erreur lors de la soumission du document KYC: ${error.message}`);
        }
    }
    async getKycDocument(id) {
        const kycDocument = await this.prisma.kycDocument.findUnique({
            where: { id },
            include: {
                kycDocumentPages: {
                    orderBy: {
                        pageNumber: 'asc',
                    },
                    select: {
                        id: true,
                        pageNumber: true,
                        mangopayPageId: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
            select: {
                id: true,
                mangopayDocumentId: true,
                mangopayInfoId: true,
                type: true,
                status: true,
                refusalReason: true,
                refusalReasonMessage: true,
                pages: true,
                createdAt: true,
                updatedAt: true,
                kycDocumentPages: true,
                fileName: false,
                fileUrl: false,
            },
        });
        if (!kycDocument) {
            throw new common_1.NotFoundException(`Document KYC avec l'ID ${id} non trouvé`);
        }
        return kycDocument;
    }
    async getKycDocumentsByMangopayInfo(mangopayInfoId) {
        const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
            where: { id: mangopayInfoId },
        });
        if (!mangopayInfo) {
            throw new common_1.NotFoundException(`Informations Mangopay avec l'ID ${mangopayInfoId} non trouvées`);
        }
        return this.prisma.kycDocument.findMany({
            where: { mangopayInfoId },
            include: {
                kycDocumentPages: {
                    orderBy: {
                        pageNumber: 'asc',
                    },
                    select: {
                        id: true,
                        pageNumber: true,
                        mangopayPageId: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
            select: {
                id: true,
                mangopayDocumentId: true,
                mangopayInfoId: true,
                type: true,
                status: true,
                refusalReason: true,
                refusalReasonMessage: true,
                pages: true,
                createdAt: true,
                updatedAt: true,
                kycDocumentPages: true,
                fileName: false,
                fileUrl: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async updateKycDocumentStatus(id) {
        const kycDocument = await this.prisma.kycDocument.findUnique({
            where: { id },
            include: {
                mangopayInfo: true,
            },
        });
        if (!kycDocument) {
            throw new common_1.NotFoundException(`Document KYC avec l'ID ${id} non trouvé`);
        }
        try {
            const mangopayApi = this.mangopayConfigService.getMangopayApi();
            const mangopayDocument = await this.getDocumentFromMangopay(mangopayApi, kycDocument.mangopayDocumentId, kycDocument.mangopayInfo.mangopayUserId);
            const updatedKycDocument = await this.prisma.kycDocument.update({
                where: { id },
                data: {
                    status: mangopayDocument.Status || 'UNKNOWN',
                    refusalReason: mangopayDocument.RefusedReasonType || null,
                    refusalReasonMessage: mangopayDocument.RefusedReasonMessage || null,
                },
            });
            if (mangopayDocument.Status === 'VALIDATED') {
                await this.updateKycStatusIfAllDocumentsValidated(kycDocument.mangopayInfoId);
            }
            return updatedKycDocument;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la mise à jour du statut du document KYC: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Erreur lors de la mise à jour du statut du document KYC: ${error.message}`);
        }
    }
    async updateKycStatusIfAllDocumentsValidated(mangopayInfoId) {
        const kycDocuments = await this.prisma.kycDocument.findMany({
            where: { mangopayInfoId },
        });
        const validatedTypes = new Set(kycDocuments
            .filter(doc => doc.status === 'VALIDATED')
            .map(doc => doc.type));
        const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
            where: { id: mangopayInfoId },
        });
        if (!mangopayInfo) {
            return false;
        }
        let isFullyValidated = false;
        if (mangopayInfo.type === 'NATURAL') {
            isFullyValidated = validatedTypes.has('IDENTITY_PROOF');
        }
        else if (mangopayInfo.type === 'LEGAL') {
            const requiredTypes = [
                'REGISTRATION_PROOF',
                'ARTICLES_OF_ASSOCIATION',
                'SHAREHOLDER_DECLARATION',
            ];
            isFullyValidated = requiredTypes.every(type => validatedTypes.has(type));
        }
        if (isFullyValidated) {
            await this.mangopayInfoService.updateKycStatus(mangopayInfoId, true);
            return true;
        }
        return false;
    }
    cleanupTempFiles() {
        try {
            if (fs.existsSync(this.tempDir)) {
                const files = fs.readdirSync(this.tempDir);
                for (const file of files) {
                    if (file.startsWith('temp_')) {
                        const filePath = path.join(this.tempDir, file);
                        fs.unlinkSync(filePath);
                        this.logger.log(`Fichier temporaire nettoyé: ${filePath}`);
                    }
                }
            }
        }
        catch (error) {
            this.logger.error(`Erreur lors du nettoyage des fichiers temporaires: ${error.message}`, error.stack);
        }
    }
    async createDocumentInMangopay(mangopayApi, documentData) {
        return new Promise((resolve, reject) => {
            mangopayApi.Users.createKycDocument(documentData.UserId, {
                Type: documentData.Type,
            }, (err, document) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(document);
                }
            });
        });
    }
    async createKycPageInMangopay(mangopayApi, documentId, pageData) {
        return new Promise((resolve, reject) => {
            mangopayApi.Users.createKycPageFromFile(pageData.UserId, documentId, pageData.File, (err, response) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(response);
                }
            });
        });
    }
    async submitDocumentInMangopay(mangopayApi, documentId, userId) {
        return new Promise((resolve, reject) => {
            mangopayApi.Users.submitKycDocument(userId, documentId, (err, document) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(document);
                }
            });
        });
    }
    async getDocumentFromMangopay(mangopayApi, documentId, userId) {
        return new Promise((resolve, reject) => {
            mangopayApi.Users.getKycDocument(userId, documentId, (err, document) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(document);
                }
            });
        });
    }
};
exports.MangopayKycService = MangopayKycService;
exports.MangopayKycService = MangopayKycService = MangopayKycService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mangopay_config_service_1.MangopayConfigService,
        mangopay_info_service_1.MangopayInfoService])
], MangopayKycService);
//# sourceMappingURL=mangopay-kyc.service.js.map