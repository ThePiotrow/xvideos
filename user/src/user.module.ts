import { Module } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { MongoConfigService } from './services/config/mongo-config.service';
import { ConfigService } from './services/config/config.service';
import { UserSchema } from './schemas/user.schema';
import { UserLinkSchema } from './schemas/user-link.schema';
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
        name: 'User',
        schema: UserSchema,
        collection: 'users',
      },
      {
        name: 'UserLink',
        schema: UserLinkSchema,
        collection: 'user_links',
      },
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    ConfigService,
  ],
})
export class UserModule { }
