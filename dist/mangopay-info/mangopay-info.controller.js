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
exports.MangopayInfoController = void 0;
const common_1 = require("@nestjs/common");
const mangopay_info_service_1 = require("./mangopay-info.service");
const create_mangopay_info_dto_1 = require("./dto/create-mangopay-info.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../roles/guards/roles.guard");
const roles_decorator_1 = require("../roles/decorators/roles.decorator");
let MangopayInfoController = class MangopayInfoController {
    mangopayInfoService;
    constructor(mangopayInfoService) {
        this.mangopayInfoService = mangopayInfoService;
    }
    create(createMangopayInfoDto) {
        return this.mangopayInfoService.create(createMangopayInfoDto);
    }
    findAll() {
        return this.mangopayInfoService.findAll();
    }
    findOne(id) {
        return this.mangopayInfoService.findOne(id);
    }
    findByUserId(userId) {
        return this.mangopayInfoService.findByUserId(userId);
    }
    updateKycStatus(id, kyc) {
        return this.mangopayInfoService.updateKycStatus(id, kyc);
    }
    remove(id) {
        return this.mangopayInfoService.remove(id);
    }
};
exports.MangopayInfoController = MangopayInfoController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mangopay_info_dto_1.CreateMangopayInfoDto]),
    __metadata("design:returntype", void 0)
], MangopayInfoController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MangopayInfoController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MangopayInfoController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MangopayInfoController.prototype, "findByUserId", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Patch)(':id/kyc'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('kyc')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], MangopayInfoController.prototype, "updateKycStatus", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MangopayInfoController.prototype, "remove", null);
exports.MangopayInfoController = MangopayInfoController = __decorate([
    (0, common_1.Controller)('mangopay-info'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [mangopay_info_service_1.MangopayInfoService])
], MangopayInfoController);
//# sourceMappingURL=mangopay-info.controller.js.map