import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './domains/auth/auth.module';
import { UsersModule } from './domains/users/users.module';

@Module({
  imports: [TypeOrmModule.forRoot(TypeOrmConfig), AuthModule, UsersModule],
})
export class AppModule { }