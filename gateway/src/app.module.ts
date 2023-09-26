import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClientProxyFactory } from '@nestjs/microservices';

import { UsersController } from './users.controller';
import { MediasController } from './medias.controller';
import { LivesController } from './lives.controller';
import { AdminController } from './admin.controller';

import { AuthGuard } from './services/guards/authorization.guard';
import { AdminGuard } from './services/guards/admin.guard';
import { OwnerGuard } from './services/guards/owner.guard';

import { EventsGateway } from './events.gateway';

import { ConfigService } from './services/config/config.service';

@Module({
  imports: [],
  controllers: [UsersController, MediasController, LivesController, AdminController],
  providers: [
    ConfigService,
    {
      provide: 'TOKEN_SERVICE',
      useFactory: (configService: ConfigService) => {
        const tokenServiceOptions = configService.get('tokenService');
        return ClientProxyFactory.create(tokenServiceOptions);
      },
      inject: [ConfigService],
    },
    {
      provide: 'USER_SERVICE',
      useFactory: (configService: ConfigService) => {
        const userServiceOptions = configService.get('userService');
        return ClientProxyFactory.create(userServiceOptions);
      },
      inject: [ConfigService],
    },
    {
      provide: 'MEDIA_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create(configService.get('mediaService'));
      },
      inject: [ConfigService],
    },
    {
      provide: 'LIVE_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create(configService.get('liveService'));
      },
      inject: [ConfigService],
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AdminGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OwnerGuard,
    },
    EventsGateway,
  ],
})
export class AppModule { }
