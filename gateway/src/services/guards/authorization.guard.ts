import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) { }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const secured = this.reflector.get<string[]>(
      'secured',
      context.getHandler(),
    );

    if (!secured) {
      return true;
    }

    let token = null;

    const request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      throw new HttpException(
        {
          message: '[AuthGuard] You do not have permission to access this resource',
          data: null,

          errors: null,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    token = request.headers.authorization.split('Bearer ')[1];

    if (!token) {
      throw new HttpException(
        {
          message: '[AuthGuard] You do not have permission to access this resource',
          data: null,

          errors: null,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userTokenInfo = await firstValueFrom(
      this.tokenServiceClient.send('token_decode', {
        token: token,
      }),
    );

    if (!userTokenInfo || !userTokenInfo.data) {
      throw new HttpException(
        {
          message: userTokenInfo.message,
          data: null,
          errors: null,
        },
        userTokenInfo.status,
      );
    }

    const userInfo = await firstValueFrom(
      this.userServiceClient.send('user_get_by_id', { id: userTokenInfo.data.userId }),
    );

    if (!userInfo || !userInfo.user) {
      throw new HttpException(
        {
          message: userInfo.message,
          data: null,
          errors: null,
        },
        userInfo.status,
      );
    }

    const user = {
      ...userInfo.user,
      id: userInfo.user.id,
    }

    request.user = user;
    return true;
  }
}
