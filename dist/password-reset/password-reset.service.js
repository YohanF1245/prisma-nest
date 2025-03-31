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
exports.PasswordResetService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const uuid_1 = require("uuid");
const bcrypt = require("bcrypt");
const mail_config_service_1 = require("../config/mail-config.service");
const mail_service_1 = require("../mail/mail.service");
let PasswordResetService = class PasswordResetService {
    prisma;
    usersService;
    mailConfigService;
    mailService;
    constructor(prisma, usersService, mailConfigService, mailService) {
        this.prisma = prisma;
        this.usersService = usersService;
        this.mailConfigService = mailConfigService;
        this.mailService = mailService;
    }
    async requestPasswordReset(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return { message: 'Si un compte avec cet email existe, un email de réinitialisation sera envoyé.' };
        }
        const token = (0, uuid_1.v4)();
        const expiresIn = this.mailConfigService.resetPasswordTokenExpiration;
        const hours = parseInt(expiresIn);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + hours);
        await this.prisma.resetPassLink.create({
            data: {
                token,
                expiresAt,
                userId: user.id,
            },
        });
        await this.mailService.sendPasswordResetEmail(email, user.firstName || user.email, token);
        return { message: 'Si un compte avec cet email existe, un email de réinitialisation sera envoyé.' };
    }
    async confirmPasswordReset(token, newPassword) {
        const resetLink = await this.prisma.resetPassLink.findUnique({
            where: { token },
        });
        if (!resetLink) {
            throw new common_1.NotFoundException('Lien de réinitialisation invalide');
        }
        if (resetLink.isUsed) {
            throw new common_1.BadRequestException('Ce lien a déjà été utilisé');
        }
        if (new Date() > resetLink.expiresAt) {
            throw new common_1.BadRequestException('Ce lien a expiré');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: resetLink.userId },
            data: { password: hashedPassword },
        });
        await this.prisma.resetPassLink.update({
            where: { id: resetLink.id },
            data: { isUsed: true },
        });
        return { message: 'Mot de passe réinitialisé avec succès' };
    }
};
exports.PasswordResetService = PasswordResetService;
exports.PasswordResetService = PasswordResetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService,
        mail_config_service_1.MailConfigService,
        mail_service_1.MailService])
], PasswordResetService);
//# sourceMappingURL=password-reset.service.js.map