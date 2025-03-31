import { PrismaService } from '../prisma/prisma.service';
import { CreateMangopayWalletDto } from './dto/create-mangopay-wallet.dto';
import { MangopayConfigService } from '../config/mangopay-config.service';
import { MangopayInfoService } from '../mangopay-info/mangopay-info.service';
export declare class MangopayWalletService {
    private prisma;
    private mangopayConfigService;
    private mangopayInfoService;
    private readonly logger;
    constructor(prisma: PrismaService, mangopayConfigService: MangopayConfigService, mangopayInfoService: MangopayInfoService);
    create(createMangopayWalletDto: CreateMangopayWalletDto): Promise<{
        id: string;
        mangopayWalletId: string;
        mangopayInfoId: string;
        currency: string;
        balance: number;
        status: string;
        description: string | null;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        mangopayInfoId: string;
        currency: string;
        mangopayWalletId: string;
        balance: number;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        mangopayInfoId: string;
        currency: string;
        mangopayWalletId: string;
        balance: number;
    }>;
    findByMangopayInfoId(mangopayInfoId: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        mangopayInfoId: string;
        currency: string;
        mangopayWalletId: string;
        balance: number;
    }[]>;
    findByMangopayWalletId(mangopayWalletId: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        mangopayInfoId: string;
        currency: string;
        mangopayWalletId: string;
        balance: number;
    }>;
    updateBalance(id: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        mangopayInfoId: string;
        currency: string;
        mangopayWalletId: string;
        balance: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        mangopayInfoId: string;
        currency: string;
        mangopayWalletId: string;
        balance: number;
    }>;
    private createWalletInMangopay;
    private getWalletFromMangopay;
}
