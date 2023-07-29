import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function initApp(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.HOST,
        port: parseInt(process.env.PORT),
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen();
}

initApp();