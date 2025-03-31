import { MangopayKycService } from './mangopay-kyc.service';
import { CreateKycDocumentDto } from './dto/create-kyc-document.dto';
import { UploadKycPageDto } from './dto/upload-kyc-page.dto';
import { SubmitKycDocumentDto } from './dto/submit-kyc-document.dto';
import { MulterFile } from './interfaces';
export declare class MangopayKycController {
    private readonly mangopayKycService;
    private readonly tempDir;
    constructor(mangopayKycService: MangopayKycService);
    createDocument(createKycDocumentDto: CreateKycDocumentDto, userId: string): Promise<{
        id: string;
        mangopayDocumentId: string;
        mangopayInfoId: string;
        type: string;
        status: string;
        createdAt: Date;
    }>;
    uploadPage(uploadKycPageDto: UploadKycPageDto, file: MulterFile, userId: string): Promise<{
        message: string;
        id: string;
        kycDocumentId: string;
        pageNumber: number;
        createdAt: Date;
    }>;
    submitDocument(submitKycDocumentDto: SubmitKycDocumentDto, userId: string): Promise<{
        id: string;
        mangopayDocumentId: string;
        mangopayInfoId: string;
        type: string;
        status: string;
        pages: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getDocument(id: string, userId: string): Promise<{
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
    getDocumentsByMangopayInfo(mangopayInfoId: string, userId: string): Promise<({
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
    updateDocumentStatus(id: string, userId: string): Promise<{
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
}
