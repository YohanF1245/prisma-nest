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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let MailConfigService = class MailConfigService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    get emailVerificationTokenExpiration() {
        return this.configService.get('EMAIL_VERIFICATION_TOKEN_EXPIRATION') || '24h';
    }
    get resetPasswordTokenExpiration() {
        return this.configService.get('RESET_PASSWORD_TOKEN_EXPIRATION') || '1h';
    }
};
exports.MailConfigService = MailConfigService;
exports.MailConfigService = MailConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailConfigService);
//# sourceMappingURL=mail-config.service.js.map