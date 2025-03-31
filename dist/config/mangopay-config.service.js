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
exports.MangopayConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mangopay = require("mangopay2-nodejs-sdk");
let MangopayConfigService = class MangopayConfigService {
    configService;
    mangopayApi;
    constructor(configService) {
        this.configService = configService;
        this.initMangopay();
    }
    initMangopay() {
        const clientId = this.configService.get('MANGOPAY_CLIENT_ID');
        const clientApiKey = this.configService.get('MANGOPAY_API_KEY');
        const baseUrl = this.configService.get('MANGOPAY_BASE_URL', 'https://api.sandbox.mangopay.com');
        if (!clientId || !clientApiKey) {
            console.warn('Mangopay credentials not found. Using demo mode.');
            return;
        }
        this.mangopayApi = new mangopay({
            clientId: clientId,
            clientApiKey: clientApiKey,
            baseUrl: baseUrl,
        });
    }
    getMangopayApi() {
        if (!this.mangopayApi) {
            throw new Error('Mangopay API not initialized');
        }
        return this.mangopayApi;
    }
};
exports.MangopayConfigService = MangopayConfigService;
exports.MangopayConfigService = MangopayConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MangopayConfigService);
//# sourceMappingURL=mangopay-config.service.js.map