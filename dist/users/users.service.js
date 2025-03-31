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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
const roles_service_1 = require("../roles/roles.service");
let UsersService = class UsersService {
    prisma;
    rolesService;
    constructor(prisma, rolesService) {
        this.prisma = prisma;
        this.rolesService = rolesService;
    }
    async create(createUserDto) {
        const { email, password, firstName, lastName } = createUserDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Un utilisateur avec cet email existe déjà');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
            },
        });
        await this.rolesService.assignRoleToUser(user.id, 'USER');
        return { id: user.id };
    }
    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }
    async update(id, updateUserDto) {
        const { email, password, firstName, lastName } = updateUserDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
        }
        if (email && email !== existingUser.email) {
            const userWithEmail = await this.prisma.user.findUnique({
                where: { email },
            });
            if (userWithEmail) {
                throw new common_1.ConflictException('Un utilisateur avec cet email existe déjà');
            }
        }
        const data = {};
        if (email)
            data.email = email;
        if (firstName)
            data.firstName = firstName;
        if (lastName)
            data.lastName = lastName;
        if (password)
            data.password = await bcrypt.hash(password, 10);
        return this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async remove(id) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return { success: true };
    }
    async markEmailAsVerified(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isEmailVerified: true,
            },
        });
    }
    async getUserRoles(userId) {
        return this.rolesService.getUserRoles(userId);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        roles_service_1.RolesService])
], UsersService);
//# sourceMappingURL=users.service.js.map