"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangopayInfoModule = void 0;
const common_1 = require("@nestjs/common");
const mangopay_info_service_1 = require("./mangopay-info.service");
const mangopay_info_controller_1 = require("./mangopay-info.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const config_module_1 = require("../config/config.module");
let MangopayInfoModule = class MangopayInfoModule {
};
exports.MangopayInfoModule = MangopayInfoModule;
exports.MangopayInfoModule = MangopayInfoModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, config_module_1.ConfigModule],
        controllers: [mangopay_info_controller_1.MangopayInfoController],
        providers: [mangopay_info_service_1.MangopayInfoService],
        exports: [mangopay_info_service_1.MangopayInfoService],
    })
], MangopayInfoModule);
//# sourceMappingURL=mangopay-info.module.js.map