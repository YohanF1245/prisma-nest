import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface MailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
  attachments?: {
    filename: string;
    content?: any;
    path?: string;
    contentType?: string;
  }[];
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private templatesDir: string;

  constructor(private configService: ConfigService) {
    this.templatesDir = path.join(process.cwd(), 'templates/emails');
    
    // Créer le répertoire des templates s'il n'existe pas
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }

    // Configuration du transporteur d'emails
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');
    const secure = this.configService.get<boolean>('MAIL_SECURE', false);
    
    // Vérifier si les variables d'environnement sont définies
    if (!host || !port || !user || !pass) {
      this.logger.warn('Configuration de mail incomplète. L\'envoi d\'emails est désactivé.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    // Vérifier que la connexion fonctionne
    this.transporter.verify()
      .then(() => this.logger.log('Connexion au serveur SMTP établie'))
      .catch(err => this.logger.error(`Erreur de connexion au serveur SMTP: ${err.message}`));
  }

  /**
   * Envoie un email basé sur un template
   */
  async sendMail(options: MailOptions): Promise<boolean> {
    try {
      // Si le transporteur n'est pas configuré, on simule l'envoi
      if (!this.transporter) {
        this.logger.debug(`[SIMULATION] Email envoyé à ${options.to} avec le sujet: ${options.subject}`);
        this.logger.debug(`[SIMULATION] Contenu: ${JSON.stringify(options.context)}`);
        return true;
      }

      // Charger et compiler le template
      const templateContent = this.loadTemplate(options.template);
      const template = Handlebars.compile(templateContent);
      const html = template(options.context);

      // Envoyer l'email
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: options.to,
        subject: options.subject,
        html,
        attachments: options.attachments,
      });

      this.logger.log(`Email envoyé à ${options.to} avec le sujet: ${options.subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Erreur d'envoi d'email: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Envoie un email de vérification d'adresse email
   */
  async sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
    const verificationUrl = `${this.configService.get<string>('APP_URL')}/email-verification/verify/${token}`;
    
    return this.sendMail({
      to: email,
      subject: 'Vérification de votre adresse email',
      template: 'email-verification',
      context: {
        name: name || email,
        verificationUrl,
      },
    });
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
    const resetUrl = `${this.configService.get<string>('APP_URL')}/reset-password/${token}`;
    
    return this.sendMail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      template: 'password-reset',
      context: {
        name: name || email,
        resetUrl,
      },
    });
  }

  /**
   * Envoie une notification à l'utilisateur
   */
  async sendNotification(email: string, name: string, subject: string, message: string): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject,
      template: 'notification',
      context: {
        name: name || email,
        message,
      },
    });
  }

  /**
   * Envoie un email marketing
   */
  async sendMarketingEmail(emails: string[], subject: string, content: string, attachments?: any[]): Promise<boolean> {
    return this.sendMail({
      to: emails,
      subject,
      template: 'marketing',
      context: {
        content,
      },
      attachments,
    });
  }

  /**
   * Charge un template d'email
   */
  private loadTemplate(templateName: string): string {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    
    // Vérifier si le template existe
    if (!fs.existsSync(templatePath)) {
      // Si le template n'existe pas, créer un template par défaut
      this.createDefaultTemplate(templateName);
    }
    
    return fs.readFileSync(templatePath, 'utf8');
  }

  /**
   * Crée un template par défaut si le template demandé n'existe pas
   */
  private createDefaultTemplate(templateName: string): void {
    let templateContent = '';
    
    switch (templateName) {
      case 'email-verification':
        templateContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Vérification de votre adresse email</h2>
            <p>Bonjour {{name}},</p>
            <p>Merci de vous être inscrit. Veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email :</p>
            <p><a href="{{verificationUrl}}" class="button">Vérifier mon email</a></p>
            <p>Si le bouton ne fonctionne pas, vous pouvez également copier et coller ce lien dans votre navigateur :</p>
            <p>{{verificationUrl}}</p>
            <p>Cordialement,</p>
            <p>L'équipe</p>
          </div>
        </body>
        </html>
        `;
        break;
      
      case 'password-reset':
        templateContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Réinitialisation de votre mot de passe</h2>
            <p>Bonjour {{name}},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <p><a href="{{resetUrl}}" class="button">Réinitialiser mon mot de passe</a></p>
            <p>Si le bouton ne fonctionne pas, vous pouvez également copier et coller ce lien dans votre navigateur :</p>
            <p>{{resetUrl}}</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
            <p>Cordialement,</p>
            <p>L'équipe</p>
          </div>
        </body>
        </html>
        `;
        break;
      
      case 'notification':
        templateContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Notification</h2>
            <p>Bonjour {{name}},</p>
            <p>{{message}}</p>
            <p>Cordialement,</p>
            <p>L'équipe</p>
          </div>
        </body>
        </html>
        `;
        break;
      
      case 'marketing':
        templateContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            {{{content}}}
            <p style="font-size: 12px; color: #999; margin-top: 50px;">
              Pour vous désabonner de ces emails, <a href="{{unsubscribeUrl}}">cliquez ici</a>.
            </p>
          </div>
        </body>
        </html>
        `;
        break;
      
      default:
        templateContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            {{#each context}}
              <p>{{@key}}: {{this}}</p>
            {{/each}}
          </div>
        </body>
        </html>
        `;
    }
    
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    fs.writeFileSync(templatePath, templateContent);
    this.logger.log(`Template par défaut créé: ${templateName}.hbs`);
  }
} 