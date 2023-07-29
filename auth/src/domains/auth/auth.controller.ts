import {
  ClassSerializerInterceptor,
  Controller,
  Inject,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { User } from '../users/users.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, TokenRequest } from './auth.guard';

@ApiTags('Auth')
@Controller()
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;

  @EventPattern('register')
  @UseInterceptors(ClassSerializerInterceptor)
  public register(@Payload() body: RegisterDto): Promise<User> {
    return this.authService.register(body);
  }

  @EventPattern('login')
  public async login(
    @Payload() body: LoginDto,
  ): Promise<Record<string, string>> {
    const token = await this.authService.login(body);
    return {
      token,
      status: token ? '200' : '401',
    };
  }

  @EventPattern('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public getOneUserByToken(@Payload() request: TokenRequest): User | null {
    return request.user;
  }
}
