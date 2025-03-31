"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationModule = void 0;
const common_1 = require("@nestjs/common");
const registration_controller_1 = require("./registration.controller");
const registration_service_1 = require("./registration.service");
const users_module_1 = require("../users/users.module");
const email_verification_module_1 = require("../email-verification/email-verification.module");
const mangopay_info_module_1 = require("../mangopay-info/mangopay-info.module");
let RegistrationModule = class RegistrationModule {
};
exports.RegistrationModule = RegistrationModule;
exports.RegistrationModule = RegistrationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            email_verification_module_1.EmailVerificationModule,
            mangopay_info_module_1.MangopayInfoModule,
        ],
        controllers: [registration_controller_1.RegistrationController],
        providers: [registration_service_1.RegistrationService],
    })
], RegistrationModule);
//# sourceMappingURL=registration.module.js.map