import { NestFactory } from '@nestjs/core';
import { MediaModule } from './media.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { ConfigService } from './services/config/config.service';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MediaModule,
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
