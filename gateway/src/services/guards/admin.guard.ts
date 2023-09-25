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

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) { }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<string[]>(
      'admin',
      context.getHandler(),
    );

    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    console.log('request.user', request.user);

    if (request.user.role !== 'ROLE_ADMIN') {
      throw new HttpException(
        {
          message: '[AdminGuard] You do not have permission to access this resource',
          data: null,
          errors: null,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return true;
  }
}
