import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany();
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Rôle avec l'ID ${id} non trouvé`);
    }

    return role;
  }

  async findByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }

  async create(name: string, description?: string) {
    return this.prisma.role.create({
      data: {
        name,
        description: description || `Rôle ${name}`,
      },
    });
  }

  async update(id: string, name?: string, description?: string) {
    const data: any = {};
    if (name) data.name = name;
    if (description) data.description = description;

    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.prisma.role.delete({
      where: { id },
    });
    return { success: true };
  }

  async assignRoleToUser(userId: string, roleName: string) {
    // Vérifier si le rôle existe
    let role = await this.findByName(roleName);

    // Si le rôle n'existe pas, le créer
    if (!role) {
      role = await this.create(roleName);
    }

    // Vérifier si l'utilisateur a déjà ce rôle
    const existingUserRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        roleId: role.id,
      },
    });

    if (!existingUserRole) {
      // Attribuer le rôle à l'utilisateur
      await this.prisma.userRole.create({
        data: {
          userId,
          roleId: role.id,
        },
      });
    }

    return role;
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });
    return { success: true };
  }

  async getUserRoles(userId: string): Promise<Role[]> {
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
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    return userWithRoles.roles.map((userRole) => userRole.role);
  }
} 