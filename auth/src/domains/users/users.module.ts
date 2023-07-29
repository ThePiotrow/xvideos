import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { AuthHelper } from '../auth/auth.helper';
import { JwtStrategy } from '../auth/auth.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_KEY'),
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    UsersService,
    AuthHelper,
    JwtStrategy,
    ConfigService,
    AuthService,
  ],
  controllers: [UsersController],
})
export class UsersModule { }