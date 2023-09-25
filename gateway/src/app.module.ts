import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClientProxyFactory } from '@nestjs/microservices';

import { UsersController } from './users.controller';
import { MediasController } from './medias.controller';

import { AuthGuard } from './services/guards/authorization.guard';
import { PermissionGuard } from './services/guards/permission.guard';

import { ConfigService } from './services/config/config.service';
import { LivesController } from './lives.controller';

import { EventsGateway } from './events.gateway';
import { AdminGuard } from './services/guards/admin.guard';
import { AdminController } from './admin.controller';
import { OwnerGuard } from './services/guards/owner.guard';

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
      provide: 'PERMISSION_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create(
          configService.get('permissionService'),
        );
      },
      inject: [ConfigService],
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
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
