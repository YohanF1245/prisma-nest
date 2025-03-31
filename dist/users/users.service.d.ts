import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesService } from '../roles/roles.service';
export declare class UsersService {
    private prisma;
    private rolesService;
    constructor(prisma: PrismaService, rolesService: RolesService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
    }>;
    findAll(): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isEmailVerified: boolean;
        roles: {
            role: {
                id: string;
                name: string;
            };
        }[];
    }[]>;
    findOne(id: string): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isEmailVerified: boolean;
        roles: {
            role: {
                id: string;
                name: string;
            };
        }[];
    }>;
    findByEmail(email: string): Promise<({
        roles: ({
            role: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            roleId: string;
        })[];
    } & {
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isEmailVerified: boolean;
    }) | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isEmailVerified: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    markEmailAsVerified(userId: string): Promise<{
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isEmailVerified: boolean;
    }>;
    getUserRoles(userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
