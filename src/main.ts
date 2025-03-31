import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuration de la sécurité
  app.use(helmet());
  app.enableCors();
  
  // Configuration de la validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // supprime les propriétés non décorées
      forbidNonWhitelisted: true, // rejette les requêtes avec des propriétés non décorées
      transform: true, // transforme automatiquement les types primitifs
    }),
  );
  
  // Préfixe global de l'API
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`L'application est accessible sur: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
