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
exports.AddressController = void 0;
const common_1 = require("@nestjs/common");
const address_service_1 = require("./address.service");
const create_address_dto_1 = require("./dto/create-address.dto");
const update_address_dto_1 = require("./dto/update-address.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../roles/guards/roles.guard");
const roles_decorator_1 = require("../roles/decorators/roles.decorator");
const user_decorator_1 = require("../auth/decorators/user.decorator");
let AddressController = class AddressController {
    addressService;
    constructor(addressService) {
        this.addressService = addressService;
    }
    create(createAddressDto, user) {
        if (user.id !== createAddressDto.userId && !user.roles.includes('ADMIN')) {
            throw new common_1.ForbiddenException("Vous n'êtes pas autorisé à créer une adresse pour cet utilisateur");
        }
        return this.addressService.create(createAddressDto);
    }
    findAll() {
        return this.addressService.findAll();
    }
    findAllByUserId(userId, user) {
        if (user.id !== userId && !user.roles.includes('ADMIN')) {
            throw new common_1.ForbiddenException("Vous n'êtes pas autorisé à voir les adresses de cet utilisateur");
        }
        return this.addressService.findAllByUserId(userId);
    }
    async findOne(id, user) {
        const address = await this.addressService.findOne(id);
        if (user.id !== address.userId && !user.roles.includes('ADMIN')) {
            throw new common_1.ForbiddenException("Vous n'êtes pas autorisé à voir cette adresse");
        }
        return address;
    }
    async update(id, updateAddressDto, user) {
        const address = await this.addressService.findOne(id);
        if (user.id !== address.userId && !user.roles.includes('ADMIN')) {
            throw new common_1.ForbiddenException("Vous n'êtes pas autorisé à mettre à jour cette adresse");
        }
        return this.addressService.update(id, updateAddressDto);
    }
    async remove(id, user) {
        const address = await this.addressService.findOne(id);
        if (user.id !== address.userId && !user.roles.includes('ADMIN')) {
            throw new common_1.ForbiddenException("Vous n'êtes pas autorisé à supprimer cette adresse");
        }
        return this.addressService.remove(id);
    }
    async setPrimary(id, user) {
        const address = await this.addressService.findOne(id);
        if (user.id !== address.userId && !user.roles.includes('ADMIN')) {
            throw new common_1.ForbiddenException("Vous n'êtes pas autorisé à définir cette adresse comme primaire");
        }
        return this.addressService.setPrimaryAddress(id, address.userId);
    }
    async getDefaultShippingAddress(userId, user) {
        if (user.id !== userId && !user.roles.includes('ADMIN')) {
            throw new common_1.ForbiddenException("Vous n'êtes pas autorisé à voir l'adresse de livraison par défaut de cet utilisateur");
        }
        return this.addressService.getDefaultShippingAddress(userId);
    }
    async getDefaultBillingAddress(userId, user) {
        if (user.id !== userId && !user.roles.includes('ADMIN')) {
            throw new common_1.ForbiddenException("Vous n'êtes pas autorisé à voir l'adresse de facturation par défaut de cet utilisateur");
        }
        return this.addressService.getDefaultBillingAddress(userId);
    }
};
exports.AddressController = AddressController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_address_dto_1.CreateAddressDto, Object]),
    __metadata("design:returntype", void 0)
], AddressController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AddressController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AddressController.prototype, "findAllByUserId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_address_dto_1.UpdateAddressDto, Object]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/set-primary'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "setPrimary", null);
__decorate([
    (0, common_1.Get)('user/:userId/shipping'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "getDefaultShippingAddress", null);
__decorate([
    (0, common_1.Get)('user/:userId/billing'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "getDefaultBillingAddress", null);
exports.AddressController = AddressController = __decorate([
    (0, common_1.Controller)('addresses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [address_service_1.AddressService])
], AddressController);
//# sourceMappingURL=address.controller.js.map