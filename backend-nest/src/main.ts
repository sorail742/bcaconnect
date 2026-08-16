import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Équivalent Nest idiomatique d'express-validator (validateRequest) :
  // whitelist retire les champs non déclarés dans le DTO, forbidNonWhitelisted
  // rejette la requête (400) si un champ imprévu est envoyé.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 4001);
}
bootstrap();
