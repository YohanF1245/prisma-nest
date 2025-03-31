import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
}
