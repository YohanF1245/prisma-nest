import { PrismaService } from '../prisma/prisma.service';
import { MangopayConfigService } from '../config/mangopay-config.service';
import { MangopayInfoService } from '../mangopay-info/mangopay-info.service';
import { CreateKycDocumentDto } from './dto/create-kyc-document.dto';
import { UploadKycPageDto } from './dto/upload-kyc-page.dto';
import { SubmitKycDocumentDto } from './dto/submit-kyc-document.dto';
import { MulterFile } from './interfaces';
export declare class MangopayKycService {
    private prisma;
    private mangopayConfigService;
    private mangopayInfoService;
    private readonly logger;
    private readonly tempDir;
    constructor(prisma: PrismaService, mangopayConfigService: MangopayConfigService, mangopayInfoService: MangopayInfoService);
    createKycDocument(createKycDocumentDto: CreateKycDocumentDto): Promise<{
        id: string;
        mangopayDocumentId: string;
        mangopayInfoId: string;
        type: string;
        status: string;
        createdAt: Date;
    }>;
    uploadKycPage(uploadKycPageDto: UploadKycPageDto, file: MulterFile): Promise<{
        id: string;
        kycDocumentId: string;
        pageNumber: number;
        createdAt: Date;
    }>;
    submitKycDocument(submitKycDocumentDto: SubmitKycDocumentDto): Promise<{
        id: string;
        mangopayDocumentId: string;
        mangopayInfoId: string;
        type: string;
        status: string;
        pages: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getKycDocument(id: string): Promise<{
        id: string;
        mangopayDocumentId: string;
        mangopayInfoId: string;
        type: string;
        status: string;
        refusalReason: string | null;
        refusalReasonMessage: string | null;
        pages: number;
        createdAt: Date;
        updatedAt: Date;
        kycDocumentPages: {
            id: string;
            fileUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            kycDocumentId: string;
            mangopayPageId: string | null;
            pageNumber: number;
        }[];
    } & {
        id: string;
        mangopayDocumentId: string;
        mangopayInfoId: string;
        type: string;
        status: string;
        refusalReason: string | null;
        refusalReasonMessage: string | null;
        fileName: string | null;
        fileUrl: string | null;
        pages: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getKycDocumentsByMangopayInfo(mangopayInfoId: string): Promise<({
        id: string;
        mangopayDocumentId: string;
        mangopayInfoId: string;
        type: string;
        status: string;
        refusalReason: string | null;
        refusalReasonMessage: string | null;
        pages: number;
        createdAt: Date;
        updatedAt: Date;
        kycDocumentPages: {
            id: string;
            fileUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            kycDocumentId: string;
            mangopayPageId: string | null;
            pageNumber: number;
        }[];
    } & {
        id: string;
        mangopayDocumentId: string;
        mangopayInfoId: string;
        type: string;
        status: string;
        refusalReason: string | null;
        refusalReasonMessage: string | null;
        fileName: string | null;
        fileUrl: string | null;
        pages: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateKycDocumentStatus(id: string): Promise<{
        id: string;
        mangopayDocumentId: string;
        mangopayInfoId: string;
        type: string;
        status: string;
        refusalReason: string | null;
        refusalReasonMessage: string | null;
        fileName: string | null;
        fileUrl: string | null;
        pages: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateKycStatusIfAllDocumentsValidated(mangopayInfoId: string): Promise<boolean>;
    private cleanupTempFiles;
    private createDocumentInMangopay;
    private createKycPageInMangopay;
    private submitDocumentInMangopay;
    private getDocumentFromMangopay;
}
