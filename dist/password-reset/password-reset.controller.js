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
exports.PasswordResetController = void 0;
const common_1 = require("@nestjs/common");
const password_reset_service_1 = require("./password-reset.service");
const request_password_reset_dto_1 = require("./dto/request-password-reset.dto");
const confirm_password_reset_dto_1 = require("./dto/confirm-password-reset.dto");
let PasswordResetController = class PasswordResetController {
    passwordResetService;
    constructor(passwordResetService) {
        this.passwordResetService = passwordResetService;
    }
    async requestPasswordReset(requestDto) {
        return this.passwordResetService.requestPasswordReset(requestDto.email);
    }
    async confirmPasswordReset(confirmDto) {
        return this.passwordResetService.confirmPasswordReset(confirmDto.token, confirmDto.newPassword);
    }
};
exports.PasswordResetController = PasswordResetController;
__decorate([
    (0, common_1.Post)('request'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_password_reset_dto_1.RequestPasswordResetDto]),
    __metadata("design:returntype", Promise)
], PasswordResetController.prototype, "requestPasswordReset", null);
__decorate([
    (0, common_1.Post)('confirm'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirm_password_reset_dto_1.ConfirmPasswordResetDto]),
    __metadata("design:returntype", Promise)
], PasswordResetController.prototype, "confirmPasswordReset", null);
exports.PasswordResetController = PasswordResetController = __decorate([
    (0, common_1.Controller)('password-reset'),
    __metadata("design:paramtypes", [password_reset_service_1.PasswordResetService])
], PasswordResetController);
//# sourceMappingURL=password-reset.controller.js.map