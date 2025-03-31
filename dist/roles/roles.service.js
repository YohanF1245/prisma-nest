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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RolesService = class RolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.role.findMany();
    }
    async findOne(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Rôle avec l'ID ${id} non trouvé`);
        }
        return role;
    }
    async findByName(name) {
        return this.prisma.role.findUnique({
            where: { name },
        });
    }
    async create(name, description) {
        return this.prisma.role.create({
            data: {
                name,
                description: description || `Rôle ${name}`,
            },
        });
    }
    async update(id, name, description) {
        const data = {};
        if (name)
            data.name = name;
        if (description)
            data.description = description;
        return this.prisma.role.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        await this.prisma.role.delete({
            where: { id },
        });
        return { success: true };
    }
    async assignRoleToUser(userId, roleName) {
        let role = await this.findByName(roleName);
        if (!role) {
            role = await this.create(roleName);
        }
        const existingUserRole = await this.prisma.userRole.findFirst({
            where: {
                userId,
                roleId: role.id,
            },
        });
        if (!existingUserRole) {
            await this.prisma.userRole.create({
                data: {
                    userId,
                    roleId: role.id,
                },
            });
        }
        return role;
    }
    async removeRoleFromUser(userId, roleId) {
        await this.prisma.userRole.deleteMany({
            where: {
                userId,
                roleId,
            },
        });
        return { success: true };
    }
    async getUserRoles(userId) {
        const userWithRoles = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        if (!userWithRoles) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
        }
        return userWithRoles.roles.map((userRole) => userRole.role);
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map