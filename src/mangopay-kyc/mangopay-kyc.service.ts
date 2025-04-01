import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MangopayConfigService } from '../config/mangopay-config.service';
import { MangopayInfoService } from '../mangopay-info/mangopay-info.service';
import { CreateKycDocumentDto } from './dto/create-kyc-document.dto';
import { UploadKycPageDto } from './dto/upload-kyc-page.dto';
import { SubmitKycDocumentDto } from './dto/submit-kyc-document.dto';
import { MangopayDocument, MangopayPage, MulterFile } from './interfaces';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
et class MangopayKycService {
  private readonly logger = new Logger(MangopayKycService.name);
  private readonly tempDir = path.join(os.tmpdir(), 'mangopay-uploads');

  constructor(
    private prisma: PrismaService,
    private mangopayConfigService: MangopayConfigService,
    private mangopayInfoService: MangopayInfoService,
  ) {
    // S'assurer que le répertoire temporaire existe
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async createKycDocument(createKycDocumentDto: CreateKycDocumentDto) {
    const { mangopayInfoId, type } = createKycDocumentDto;

    // Vérifier si les informations Mangopay existent
    const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
      where: { id: mangopayInfoId },
    });

    if (!mangopayInfo) {
      throw new NotFoundException(`Informations Mangopay avec l'ID ${mangopayInfoId} non trouvées`);
    }

    try {
      const mangopayApi = this.mangopayConfigService.getMangopayApi();
      
      // Créer le document KYC dans Mangopay
      const documentData = {
        Type: type,
        UserId: mangopayInfo.mangopayUserId,
      };

      const mangopayDocument = await this.createDocumentInMangopay(mangopayApi, documentData) as MangopayDocument;

      // Enregistrer les métadonnées du document dans la base de données, PAS le document lui-même
      const kycDocument = await this.prisma.kycDocument.create({
        data: {
          mangopayDocumentId: mangopayDocument.Id,
          mangopayInfoId,
          type,
          status: 'CREATED',
          fileName: null, // Ne pas stocker le nom du fichier pour éviter de référencer les documents sensibles
          fileUrl: null,  // Ne pas stocker de lien vers le document
        },
      });

      return {
        id: kycDocument.id,
        mangopayDocumentId: kycDocument.mangopayDocumentId,
        mangopayInfoId: kycDocument.mangopayInfoId,
        type: kycDocument.type,
        status: kycDocument.status,
        createdAt: kycDocument.createdAt,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la création du document KYC: ${error.message}`, error.stack);
      throw new BadRequestException(`Erreur lors de la création du document KYC: ${error.message}`);
    }
  }

  async uploadKycPage(uploadKycPageDto: UploadKycPageDto, file: MulterFile) {
    const { kycDocumentId, pageNumber } = uploadKycPageDto;

    // Vérifier si le document KYC existe
    const kycDocument = await this.prisma.kycDocument.findUnique({
      where: { id: kycDocumentId },
      include: {
        mangopayInfo: true,
      },
    });

    if (!kycDocument) {
      throw new NotFoundException(`Document KYC avec l'ID ${kycDocumentId} non trouvé`);
    }

    if (!file) {
      throw new BadRequestException('Aucun fichier fourni pour l\'upload');
    }

    try {
      const mangopayApi = this.mangopayConfigService.getMangopayApi();
      
      // Sauvegarder le fichier temporaire pour l'API Mangopay - sera supprimé immédiatement après
      const tempFileName = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const filePath = path.join(this.tempDir, tempFileName);
      
      // Écrire temporairement le fichier pour l'envoyer à Mangopay
      fs.writeFileSync(filePath, file.buffer);

      // Préparer les données pour l'upload de la page
      const pageData = {
        File: fs.createReadStream(filePath),
        PageNumber: pageNumber,
        UserId: kycDocument.mangopayInfo.mangopayUserId
      };

      // Uploader la page vers Mangopay
      const response = await this.createKycPageInMangopay(
        mangopayApi, 
        kycDocument.mangopayDocumentId, 
        pageData
      ) as MangopayPage;

      // Stocker UNIQUEMENT les métadonnées de la page dans notre base de données
      const kycDocumentPage = await this.prisma.kycDocumentPage.create({
        data: {
          kycDocumentId,
          mangopayPageId: response && response.Id ? response.Id : null,
          pageNumber,
          fileUrl: null, // Ne pas stocker d'URL ou de chemin vers le document
        },
      });

      // Mettre à jour le nombre de pages dans le document
      await this.prisma.kycDocument.update({
        where: { id: kycDocumentId },
        data: {
          pages: {
            increment: 1,
          },
        },
      });

      // Nettoyer immédiatement le fichier temporaire
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log('Fichier temporaire supprimé après upload vers Mangopay');
      }

      return {
        id: kycDocumentPage.id,
        kycDocumentId: kycDocumentPage.kycDocumentId,
        pageNumber: kycDocumentPage.pageNumber,
        createdAt: kycDocumentPage.createdAt,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de l'upload de la page KYC: ${error.message}`, error.stack);
      
      // Nettoyer tous les fichiers temporaires en cas d'erreur
      this.cleanupTempFiles();
      
      throw new BadRequestException(`Erreur lors de l'upload de la page KYC: ${error.message}`);
    }
  }

  async submitKycDocument(submitKycDocumentDto: SubmitKycDocumentDto) {
    const { kycDocumentId } = submitKycDocumentDto;

    // Vérifier si le document KYC existe
    const kycDocument = await this.prisma.kycDocument.findUnique({
      where: { id: kycDocumentId },
      include: {
        kycDocumentPages: true,
        mangopayInfo: true,
      },
    });

    if (!kycDocument) {
      throw new NotFoundException(`Document KYC avec l'ID ${kycDocumentId} non trouvé`);
    }

    if (kycDocument.kycDocumentPages.length === 0) {
      throw new BadRequestException('Impossible de soumettre un document sans pages');
    }

    try {
      const mangopayApi = this.mangopayConfigService.getMangopayApi();
      
      // Soumettre le document pour validation
      await this.submitDocumentInMangopay(
        mangopayApi, 
        kycDocument.mangopayDocumentId,
        kycDocument.mangopayInfo.mangopayUserId
      );

      // Mettre à jour le statut du document dans notre base de données
      const updatedKycDocument = await this.prisma.kycDocument.update({
        where: { id: kycDocumentId },
        data: {
          status: 'VALIDATION_ASKED',
        },
      });

      return {
        id: updatedKycDocument.id,
        mangopayDocumentId: updatedKycDocument.mangopayDocumentId,
        mangopayInfoId: updatedKycDocument.mangopayInfoId,
        type: updatedKycDocument.type,
        status: updatedKycDocument.status,
        pages: updatedKycDocument.pages,
        createdAt: updatedKycDocument.createdAt,
        updatedAt: updatedKycDocument.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la soumission du document KYC: ${error.message}`, error.stack);
      throw new BadRequestException(`Erreur lors de la soumission du document KYC: ${error.message}`);
    }
  }

  async getKycDocument(id: string) {
    const kycDocument = await this.prisma.kycDocument.findUnique({
      where: { id },
      include: {
        kycDocumentPages: {
          orderBy: {
            pageNumber: 'asc',
          },
          // Ne récupérer que les métadonnées, pas les données de fichier
          select: {
            id: true,
            pageNumber: true,
            mangopayPageId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      // Explicitement exclure tout champ potentiellement sensible
      select: {
        id: true,
        mangopayDocumentId: true,
        mangopayInfoId: true,
        type: true,
        status: true,
        refusalReason: true,
        refusalReasonMessage: true,
        pages: true,
        createdAt: true,
        updatedAt: true,
        kycDocumentPages: true,
        // Explicitement exclure les champs sensibles
        fileName: false,
        fileUrl: false,
      },
    });

    if (!kycDocument) {
      throw new NotFoundException(`Document KYC avec l'ID ${id} non trouvé`);
    }

    return kycDocument;
  }

  async getKycDocumentsByMangopayInfo(mangopayInfoId: string) {
    // Vérifier si les informations Mangopay existent
    const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
      where: { id: mangopayInfoId },
    });

    if (!mangopayInfo) {
      throw new NotFoundException(`Informations Mangopay avec l'ID ${mangopayInfoId} non trouvées`);
    }

    return this.prisma.kycDocument.findMany({
      where: { mangopayInfoId },
      include: {
        kycDocumentPages: {
          orderBy: {
            pageNumber: 'asc',
          },
          // Ne récupérer que les métadonnées, pas les données de fichier
          select: {
            id: true,
            pageNumber: true,
            mangopayPageId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      // Explicitement exclure tout champ potentiellement sensible
      select: {
        id: true,
        mangopayDocumentId: true,
        mangopayInfoId: true,
        type: true,
        status: true,
        refusalReason: true,
        refusalReasonMessage: true,
        pages: true,
        createdAt: true,
        updatedAt: true,
        kycDocumentPages: true,
        // Explicitement exclure les champs sensibles
        fileName: false,
        fileUrl: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateKycDocumentStatus(id: string) {
    // Vérifier si le document KYC existe
    const kycDocument = await this.prisma.kycDocument.findUnique({
      where: { id },
      include: {
        mangopayInfo: true,
      },
    });

    if (!kycDocument) {
      throw new NotFoundException(`Document KYC avec l'ID ${id} non trouvé`);
    }

    try {
      const mangopayApi = this.mangopayConfigService.getMangopayApi();
      
      // Récupérer le statut du document depuis Mangopay
      const mangopayDocument = await this.getDocumentFromMangopay(
        mangopayApi, 
        kycDocument.mangopayDocumentId,
        kycDocument.mangopayInfo.mangopayUserId
      ) as MangopayDocument;

      // Mettre à jour le statut dans notre base de données
      const updatedKycDocument = await this.prisma.kycDocument.update({
        where: { id },
        data: {
          status: mangopayDocument.Status || 'UNKNOWN',
          refusalReason: mangopayDocument.RefusedReasonType || null,
          refusalReasonMessage: mangopayDocument.RefusedReasonMessage || null,
        },
      });

      // Si le document est validé, mettre à jour le statut KYC dans MangopayInfo
      if (mangopayDocument.Status === 'VALIDATED') {
        await this.updateKycStatusIfAllDocumentsValidated(kycDocument.mangopayInfoId);
      }

      return updatedKycDocument;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du statut du document KYC: ${error.message}`, error.stack);
      throw new BadRequestException(`Erreur lors de la mise à jour du statut du document KYC: ${error.message}`);
    }
  }

  async updateKycStatusIfAllDocumentsValidated(mangopayInfoId: string) {
    // Récupérer tous les documents KYC pour cet utilisateur
    const kycDocuments = await this.prisma.kycDocument.findMany({
      where: { mangopayInfoId },
    });

    // Vérifier si au moins un document est validé pour chaque type requis
    const validatedTypes = new Set(
      kycDocuments
        .filter(doc => doc.status === 'VALIDATED')
        .map(doc => doc.type)
    );

    // Pour un utilisateur NATURAL, nous avons besoin d'une preuve d'identité
    // Pour un utilisateur LEGAL, nous avons besoin de plus de documents
    const mangopayInfo = await this.prisma.mangopayInfo.findUnique({
      where: { id: mangopayInfoId },
    });

    if (!mangopayInfo) {
      return false;
    }

    let isFullyValidated = false;

    if (mangopayInfo.type === 'NATURAL') {
      // Pour un utilisateur naturel, nous avons besoin d'une preuve d'identité
      isFullyValidated = validatedTypes.has('IDENTITY_PROOF');
    } else if (mangopayInfo.type === 'LEGAL') {
      // Pour une entité légale, nous avons besoin de plusieurs documents
      const requiredTypes = [
        'REGISTRATION_PROOF',
        'ARTICLES_OF_ASSOCIATION',
        'SHAREHOLDER_DECLARATION',
      ];
      isFullyValidated = requiredTypes.every(type => validatedTypes.has(type));
    }

    if (isFullyValidated) {
      // Mettre à jour le statut KYC dans MangopayInfo
      await this.mangopayInfoService.updateKycStatus(mangopayInfoId, true);
      return true;
    }

    return false;
  }

  // Nettoyer tous les fichiers temporaires
  private cleanupTempFiles() {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        for (const file of files) {
          if (file.startsWith('temp_')) {
            const filePath = path.join(this.tempDir, file);
            fs.unlinkSync(filePath);
            this.logger.log(`Fichier temporaire nettoyé: ${filePath}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Erreur lors du nettoyage des fichiers temporaires: ${error.message}`, error.stack);
    }
  }

  // Méthodes privées pour interagir avec l'API Mangopay

  private async createDocumentInMangopay(mangopayApi: any, documentData: any): Promise<MangopayDocument> {
    return new Promise((resolve, reject) => {
      mangopayApi.Users.createKycDocument(documentData.UserId, {
        Type: documentData.Type,
      }, (err: any, document: MangopayDocument) => {
        if (err) {
          reject(err);
        } else {
          resolve(document);
        }
      });
    });
  }

  private async createKycPageInMangopay(mangopayApi: any, documentId: string, pageData: any): Promise<MangopayPage> {
    return new Promise((resolve, reject) => {
      mangopayApi.Users.createKycPageFromFile(pageData.UserId, documentId, pageData.File, (err: any, response: MangopayPage) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  private async submitDocumentInMangopay(mangopayApi: any, documentId: string, userId: string): Promise<MangopayDocument> {
    return new Promise((resolve, reject) => {
      mangopayApi.Users.submitKycDocument(userId, documentId, (err: any, document: MangopayDocument) => {
        if (err) {
          reject(err);
        } else {
          resolve(document);
        }
      });
    });
  }

  private async getDocumentFromMangopay(mangopayApi: any, documentId: string, userId: string): Promise<MangopayDocument> {
    return new Promise((resolve, reject) => {
      mangopayApi.Users.getKycDocument(userId, documentId, (err: any, document: MangopayDocument) => {
        if (err) {
          reject(err);
        } else {
          resolve(document);
        }
      });
    });
  }
} 