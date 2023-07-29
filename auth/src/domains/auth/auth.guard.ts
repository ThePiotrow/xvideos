import { ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from '../users/users.entity';
import { RpcException } from '@nestjs/microservices';

export type TokenRequest = {
  token: string;
  user?: User;
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements IAuthGuard {
  @Inject(AuthService)
  private readonly authService: AuthService;

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req: TokenRequest = context.switchToRpc().getData();

      if (!req.token) {
        return false;
      }

      req.user = await this.authService.getOneUserByToken(req.token);
      return true;
    } catch (err) {
      throw new RpcException({
        status: '401',
        message: 'Oh shit ...',
      });
    }
  }
}
