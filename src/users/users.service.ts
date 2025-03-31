import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<{ id: string }> {
    const { email, password, firstName, lastName } = createUserDto;

    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    // Attribuer automatiquement le rôle utilisateur
    await this.assignRoleToUser(user.id, 'USER');

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

  async findOne(id: string) {
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
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return user;
  }

  async findByEmail(email: string) {
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { email, password, firstName, lastName } = updateUserDto;

    // Vérifier si l'utilisateur existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    // Si l'email est mis à jour, vérifier s'il est déjà utilisé
    if (email && email !== existingUser.email) {
      const userWithEmail = await this.prisma.user.findUnique({
        where: { email },
      });

      if (userWithEmail) {
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }
    }

    // Préparer les données à mettre à jour
    const data: any = {};
    if (email) data.email = email;
    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;
    if (password) data.password = await bcrypt.hash(password, 10);

    // Mettre à jour l'utilisateur
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

  async remove(id: string) {
    // Vérifier si l'utilisateur existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { success: true };
  }

  async markEmailAsVerified(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
      },
    });
  }

  async assignRoleToUser(userId: string, roleName: string) {
    // Vérifier si le rôle existe
    let role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    // Si le rôle n'existe pas, le créer
    if (!role) {
      role = await this.prisma.role.create({
        data: {
          name: roleName,
          description: `Rôle ${roleName}`,
        },
      });
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