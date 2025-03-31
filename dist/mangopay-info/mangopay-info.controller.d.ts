import { MangopayInfoService } from './mangopay-info.service';
import { CreateMangopayInfoDto } from './dto/create-mangopay-info.dto';
export declare class MangopayInfoController {
    private readonly mangopayInfoService;
    constructor(mangopayInfoService: MangopayInfoService);
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
}
