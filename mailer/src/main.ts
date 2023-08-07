import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppMailerModule } from './mailer.module';
import { ConfigService } from './services/config/config.service';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppMailerModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: new ConfigService().get('port'),
      },
    },
  );
  await app.listen();
}
bootstrap();
