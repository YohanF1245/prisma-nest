"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetModule = void 0;
const common_1 = require("@nestjs/common");
const password_reset_controller_1 = require("./password-reset.controller");
const password_reset_service_1 = require("./password-reset.service");
const prisma_module_1 = require("../prisma/prisma.module");
const users_module_1 = require("../users/users.module");
const config_module_1 = require("../config/config.module");
let PasswordResetModule = class PasswordResetModule {
};
exports.PasswordResetModule = PasswordResetModule;
exports.PasswordResetModule = PasswordResetModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, users_module_1.UsersModule, config_module_1.ConfigModule],
        controllers: [password_reset_controller_1.PasswordResetController],
        providers: [password_reset_service_1.PasswordResetService],
        exports: [password_reset_service_1.PasswordResetService],
    })
], PasswordResetModule);
//# sourceMappingURL=password-reset.module.js.map