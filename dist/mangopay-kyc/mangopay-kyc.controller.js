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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangopayKycController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const mangopay_kyc_service_1 = require("./mangopay-kyc.service");
const create_kyc_document_dto_1 = require("./dto/create-kyc-document.dto");
const upload_kyc_page_dto_1 = require("./dto/upload-kyc-page.dto");
const submit_kyc_document_dto_1 = require("./dto/submit-kyc-document.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../roles/guards/roles.guard");
const roles_decorator_1 = require("../roles/decorators/roles.decorator");
const user_decorator_1 = require("../auth/decorators/user.decorator");
const multer_1 = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");
let MangopayKycController = class MangopayKycController {
    mangopayKycService;
    tempDir = path.join(os.tmpdir(), 'mangopay-uploads');
    constructor(mangopayKycService) {
        this.mangopayKycService = mangopayKycService;
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }
    async createDocument(createKycDocumentDto, userId) {
        return this.mangopayKycService.createKycDocument(createKycDocumentDto);
    }
    async uploadPage(uploadKycPageDto, file, userId) {
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier fourni');
        }
        const result = await this.mangopayKycService.uploadKycPage(uploadKycPageDto, file);
        return {
            ...result,
            message: 'Votre document a été transmis avec succès à Mangopay pour vérification. Aucune copie de votre document n\'est conservée sur notre serveur.'
        };
    }
    async submitDocument(submitKycDocumentDto, userId) {
        return this.mangopayKycService.submitKycDocument(submitKycDocumentDto);
    }
    async getDocument(id, userId) {
        return this.mangopayKycService.getKycDocument(id);
    }
    async getDocumentsByMangopayInfo(mangopayInfoId, userId) {
        return this.mangopayKycService.getKycDocumentsByMangopayInfo(mangopayInfoId);
    }
    async updateDocumentStatus(id, userId) {
        return this.mangopayKycService.updateKycDocumentStatus(id);
    }
};
exports.MangopayKycController = MangopayKycController;
__decorate([
    (0, common_1.Post)('document'),
    (0, roles_decorator_1.Roles)('USER', 'ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_kyc_document_dto_1.CreateKycDocumentDto, String]),
    __metadata("design:returntype", Promise)
], MangopayKycController.prototype, "createDocument", null);
__decorate([
    (0, common_1.Post)('document/page'),
    (0, roles_decorator_1.Roles)('USER', 'ADMIN'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: os.tmpdir(),
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = path.extname(file.originalname);
                cb(null, `kyc-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Seuls les fichiers JPG, PNG et PDF sont acceptés'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, user_decorator_1.User)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upload_kyc_page_dto_1.UploadKycPageDto, Object, String]),
    __metadata("design:returntype", Promise)
], MangopayKycController.prototype, "uploadPage", null);
__decorate([
    (0, common_1.Post)('document/submit'),
    (0, roles_decorator_1.Roles)('USER', 'ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_kyc_document_dto_1.SubmitKycDocumentDto, String]),
    __metadata("design:returntype", Promise)
], MangopayKycController.prototype, "submitDocument", null);
__decorate([
    (0, common_1.Get)('document/:id'),
    (0, roles_decorator_1.Roles)('USER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, user_decorator_1.User)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MangopayKycController.prototype, "getDocument", null);
__decorate([
    (0, common_1.Get)('documents/mangopay-info/:mangopayInfoId'),
    (0, roles_decorator_1.Roles)('USER', 'ADMIN'),
    __param(0, (0, common_1.Param)('mangopayInfoId', common_1.ParseUUIDPipe)),
    __param(1, (0, user_decorator_1.User)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MangopayKycController.prototype, "getDocumentsByMangopayInfo", null);
__decorate([
    (0, common_1.Patch)('document/:id/update-status'),
    (0, roles_decorator_1.Roles)('USER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, user_decorator_1.User)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MangopayKycController.prototype, "updateDocumentStatus", null);
exports.MangopayKycController = MangopayKycController = __decorate([
    (0, common_1.Controller)('mangopay-kyc'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [mangopay_kyc_service_1.MangopayKycService])
], MangopayKycController);
//# sourceMappingURL=mangopay-kyc.controller.js.map