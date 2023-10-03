import { Module } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { MongoConfigService } from './services/config/mongo-config.service';
import { ConfigService } from './services/config/config.service';
import { UserSchema } from './schemas/user.schema';
import { UserLinkSchema } from './schemas/user-link.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://me:me@cluster.gx5xogt.mongodb.net/?retryWrites=true&w=majority&authSource=admin'
    ),
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
