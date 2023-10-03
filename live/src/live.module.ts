import { Module, } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoConfigService } from './services/config/mongo-config.service';
import { LiveController } from './live.controller';
import { LiveService } from './services/live.service';
import { LiveSchema } from './schemas/live.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://me:me@cluster.gx5xogt.mongodb.net/?retryWrites=true&w=majority&authSource=admin'
    ),
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
