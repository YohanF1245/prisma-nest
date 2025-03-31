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
var RegistrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const email_verification_service_1 = require("../email-verification/email-verification.service");
const mangopay_info_service_1 = require("../mangopay-info/mangopay-info.service");
let RegistrationService = RegistrationService_1 = class RegistrationService {
    usersService;
    emailVerificationService;
    mangopayInfoService;
    logger = new common_1.Logger(RegistrationService_1.name);
    constructor(usersService, emailVerificationService, mangopayInfoService) {
        this.usersService = usersService;
        this.emailVerificationService = emailVerificationService;
        this.mangopayInfoService = mangopayInfoService;
    }
    async register(createUserDto) {
        const result = await this.usersService.create(createUserDto);
        await this.emailVerificationService.sendVerificationEmail(result.id);
        try {
            await this.mangopayInfoService.create({
                userId: result.id,
                type: 'NATURAL',
                firstName: createUserDto.firstName || 'Unknown',
                lastName: createUserDto.lastName || 'Unknown',
                email: createUserDto.email,
                birthday: '1990-01-01',
                nationality: 'FR',
                countryOfResidence: 'FR',
            });
            this.logger.log(`Utilisateur Mangopay créé pour l'utilisateur avec l'ID ${result.id}`);
        }
        catch (error) {
            this.logger.error(`Erreur lors de la création de l'utilisateur Mangopay: ${error.message}`, error.stack);
        }
        return {
            message: 'Inscription réussie. Un email de vérification a été envoyé.',
            userId: result.id,
        };
    }
};
exports.RegistrationService = RegistrationService;
exports.RegistrationService = RegistrationService = RegistrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        email_verification_service_1.EmailVerificationService,
        mangopay_info_service_1.MangopayInfoService])
], RegistrationService);
//# sourceMappingURL=registration.service.js.map