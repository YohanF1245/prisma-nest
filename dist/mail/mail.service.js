"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const Handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
let MailService = MailService_1 = class MailService {
    configService;
    transporter;
    logger = new common_1.Logger(MailService_1.name);
    templatesDir;
    constructor(configService) {
        this.configService = configService;
        this.templatesDir = path.join(process.cwd(), 'templates/emails');
        if (!fs.existsSync(this.templatesDir)) {
            fs.mkdirSync(this.templatesDir, { recursive: true });
        }
        this.initializeTransporter();
    }
    initializeTransporter() {
        const host = this.configService.get('MAIL_HOST');
        const port = this.configService.get('MAIL_PORT');
        const user = this.configService.get('MAIL_USER');
        const pass = this.configService.get('MAIL_PASSWORD');
        const secure = this.configService.get('MAIL_SECURE', false);
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
        this.transporter.verify()
            .then(() => this.logger.log('Connexion au serveur SMTP établie'))
            .catch(err => this.logger.error(`Erreur de connexion au serveur SMTP: ${err.message}`));
    }
    async sendMail(options) {
        try {
            if (!this.transporter) {
                this.logger.debug(`[SIMULATION] Email envoyé à ${options.to} avec le sujet: ${options.subject}`);
                this.logger.debug(`[SIMULATION] Contenu: ${JSON.stringify(options.context)}`);
                return true;
            }
            const templateContent = this.loadTemplate(options.template);
            const template = Handlebars.compile(templateContent);
            const html = template(options.context);
            await this.transporter.sendMail({
                from: this.configService.get('MAIL_FROM'),
                to: options.to,
                subject: options.subject,
                html,
                attachments: options.attachments,
            });
            this.logger.log(`Email envoyé à ${options.to} avec le sujet: ${options.subject}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Erreur d'envoi d'email: ${error.message}`, error.stack);
            return false;
        }
    }
    async sendVerificationEmail(email, name, token) {
        const verificationUrl = `${this.configService.get('APP_URL')}/email-verification/verify/${token}`;
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
    async sendPasswordResetEmail(email, name, token) {
        const resetUrl = `${this.configService.get('APP_URL')}/reset-password/${token}`;
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
    async sendNotification(email, name, subject, message) {
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
    async sendMarketingEmail(emails, subject, content, attachments) {
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
    loadTemplate(templateName) {
        const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
        if (!fs.existsSync(templatePath)) {
            this.createDefaultTemplate(templateName);
        }
        return fs.readFileSync(templatePath, 'utf8');
    }
    createDefaultTemplate(templateName) {
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
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map