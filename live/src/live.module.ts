import { Module, } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoConfigService } from './services/config/mongo-config.service';
import { LiveController } from './live.controller';
import { LiveService } from './services/live.service';
import { LiveSchema } from './schemas/live.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeature([
      {
        name: 'Live',
        schema: LiveSchema,
      },
    ]),
  ],
  controllers: [LiveController],
  providers: [LiveService],
})
export class LiveModule { }
