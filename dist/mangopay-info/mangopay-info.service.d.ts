import { PrismaService } from '../prisma/prisma.service';
import { CreateMangopayInfoDto } from './dto/create-mangopay-info.dto';
import { MangopayConfigService } from '../config/mangopay-config.service';
import { AddressService } from '../address/address.service';
export declare class MangopayInfoService {
    private prisma;
    private mangopayConfigService;
    private addressService;
    private readonly logger;
    constructor(prisma: PrismaService, mangopayConfigService: MangopayConfigService, addressService: AddressService);
    create(createMangopayInfoDto: CreateMangopayInfoDto): Promise<{
        id: string;
        mangopayUserId: string;
        userId: string;
        type: string;
        status: string;
        kyc: boolean;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
        mangopayUserId: string;
        status: string;
        kyc: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
        mangopayUserId: string;
        status: string;
        kyc: boolean;
    }>;
    findByUserId(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
        mangopayUserId: string;
        status: string;
        kyc: boolean;
    }>;
    findByMangopayUserId(mangopayUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
        mangopayUserId: string;
        status: string;
        kyc: boolean;
    }>;
    updateKycStatus(id: string, kyc: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
        mangopayUserId: string;
        status: string;
        kyc: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: string;
        mangopayUserId: string;
        status: string;
        kyc: boolean;
    }>;
    private createNaturalUser;
    private createLegalUser;
    private formatBirthday;
}
