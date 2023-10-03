import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoConfigService } from './services/config/mongo-config.service';
import { MediaController } from './media.controller';
import { MediaService } from './services/media.service';
import { MediaSchema } from './schemas/media.schema';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://me:me@cluster.gx5xogt.mongodb.net/?retryWrites=true&w=majority&authSource=admin'
    ),
    MongooseModule.forFeature([
      {
        name: 'Media',
        schema: MediaSchema,
      },
    ]),
    // BullModule.registerQueue({
    //   name: 'file_queue',
    // }),

  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule { }
