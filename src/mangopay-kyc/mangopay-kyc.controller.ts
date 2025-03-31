import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MangopayKycService } from './mangopay-kyc.service';
import { CreateKycDocumentDto } from './dto/create-kyc-document.dto';
import { UploadKycPageDto } from './dto/upload-kyc-page.dto';
import { SubmitKycDocumentDto } from './dto/submit-kyc-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import { MulterFile } from './interfaces';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

@Controller('mangopay-kyc')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MangopayKycController {
  private readonly tempDir = path.join(os.tmpdir(), 'mangopay-uploads');

  constructor(private readonly mangopayKycService: MangopayKycService) {
    // S'assurer que le répertoire temporaire existe
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  @Post('document')
  @Roles('USER', 'ADMIN')
  async createDocument(
    @Body() createKycDocumentDto: CreateKycDocumentDto,
    @User('id') userId: string
  ) {
    // Vérifier si l'utilisateur est autorisé à créer ce document
    // Normalement, on vérifierait ici si mangopayInfoId appartient à cet utilisateur
    // Cette vérification devrait être faite dans un service d'autorisation
    
    return this.mangopayKycService.createKycDocument(createKycDocumentDto);
  }

  @Post('document/page')
  @Roles('USER', 'ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: os.tmpdir(),
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `kyc-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Vérifier le type de fichier
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Seuls les fichiers JPG, PNG et PDF sont acceptés'), false);
        }
        // Vérifier la taille du fichier (fait aussi dans multer, mais on peut ajouter ici une vérification supplémentaire)
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
    }),
  )
  async uploadPage(
    @Body() uploadKycPageDto: UploadKycPageDto,
    @UploadedFile() file: MulterFile,
    @User('id') userId: string
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    
    // On pourrait également vérifier ici si l'utilisateur est autorisé à télécharger une page pour ce document
    
    const result = await this.mangopayKycService.uploadKycPage(uploadKycPageDto, file);
    
    // Après avoir téléchargé la page, on informe l'utilisateur que son document a été transmis à Mangopay
    // et qu'aucune copie n'est conservée sur notre serveur
    return {
      ...result,
      message: 'Votre document a été transmis avec succès à Mangopay pour vérification. Aucune copie de votre document n\'est conservée sur notre serveur.'
    };
  }

  @Post('document/submit')
  @Roles('USER', 'ADMIN')
  async submitDocument(
    @Body() submitKycDocumentDto: SubmitKycDocumentDto,
    @User('id') userId: string
  ) {
    // Vérifier si l'utilisateur est autorisé à soumettre ce document
    
    return this.mangopayKycService.submitKycDocument(submitKycDocumentDto);
  }

  @Get('document/:id')
  @Roles('USER', 'ADMIN')
  async getDocument(@Param('id', ParseUUIDPipe) id: string, @User('id') userId: string) {
    // Vérifier si l'utilisateur est autorisé à consulter ce document
    // Note: cette méthode ne renvoie que les métadonnées, JAMAIS le contenu des documents
    
    return this.mangopayKycService.getKycDocument(id);
  }

  @Get('documents/mangopay-info/:mangopayInfoId')
  @Roles('USER', 'ADMIN')
  async getDocumentsByMangopayInfo(
    @Param('mangopayInfoId', ParseUUIDPipe) mangopayInfoId: string,
    @User('id') userId: string
  ) {
    // Vérifier si l'utilisateur est autorisé à consulter les documents pour ces informations Mangopay
    // Note: cette méthode ne renvoie que les métadonnées, JAMAIS le contenu des documents
    
    return this.mangopayKycService.getKycDocumentsByMangopayInfo(mangopayInfoId);
  }

  @Patch('document/:id/update-status')
  @Roles('USER', 'ADMIN')
  async updateDocumentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @User('id') userId: string
  ) {
    // Cette méthode interroge Mangopay pour obtenir le dernier statut d'un document
    // et met à jour notre base de données en conséquence
    
    return this.mangopayKycService.updateKycDocumentStatus(id);
  }
} 