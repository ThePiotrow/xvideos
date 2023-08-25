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
    const authHeader = request.headers.authorization;

    //If token is a query Socket.io request
    if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient();
      token = client.handshake.query.token;
    }

    //If token is a query HTTP request
    if (context.getType() === 'http') {

      const request = context.switchToHttp().getRequest();
      token = authHeader.split('Bearer ')[1];
    }
    if (!token) {
      throw new HttpException(
        {
          message: 'Token not found',
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
      this.userServiceClient.send('user_get_by_id', userTokenInfo.data.userId),
    );

    request.user = userInfo.user;
    return true;
  }
}
