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
exports.MangopayWalletController = void 0;
const common_1 = require("@nestjs/common");
const mangopay_wallet_service_1 = require("./mangopay-wallet.service");
const create_mangopay_wallet_dto_1 = require("./dto/create-mangopay-wallet.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../roles/guards/roles.guard");
const roles_decorator_1 = require("../roles/decorators/roles.decorator");
let MangopayWalletController = class MangopayWalletController {
    mangopayWalletService;
    constructor(mangopayWalletService) {
        this.mangopayWalletService = mangopayWalletService;
    }
    create(createMangopayWalletDto) {
        return this.mangopayWalletService.create(createMangopayWalletDto);
    }
    findAll() {
        return this.mangopayWalletService.findAll();
    }
    findOne(id) {
        return this.mangopayWalletService.findOne(id);
    }
    findByMangopayInfoId(mangopayInfoId) {
        return this.mangopayWalletService.findByMangopayInfoId(mangopayInfoId);
    }
    updateBalance(id) {
        return this.mangopayWalletService.updateBalance(id);
    }
    remove(id) {
        return this.mangopayWalletService.remove(id);
    }
};
exports.MangopayWalletController = MangopayWalletController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mangopay_wallet_dto_1.CreateMangopayWalletDto]),
    __metadata("design:returntype", void 0)
], MangopayWalletController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MangopayWalletController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MangopayWalletController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('info/:mangopayInfoId'),
    __param(0, (0, common_1.Param)('mangopayInfoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MangopayWalletController.prototype, "findByMangopayInfoId", null);
__decorate([
    (0, common_1.Patch)(':id/balance'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MangopayWalletController.prototype, "updateBalance", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MangopayWalletController.prototype, "remove", null);
exports.MangopayWalletController = MangopayWalletController = __decorate([
    (0, common_1.Controller)('mangopay-wallet'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [mangopay_wallet_service_1.MangopayWalletService])
], MangopayWalletController);
//# sourceMappingURL=mangopay-wallet.controller.js.map