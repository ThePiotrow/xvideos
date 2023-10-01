import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TokenService } from './services/token.service';
import { ITokenResponse } from './interfaces/token-response.interface';
import { ITokenDataResponse } from './interfaces/token-data-response.interface';
import { ITokenDestroyResponse } from './interfaces/token-destroy-response.interface';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) { }

  @MessagePattern('token_create')
  public async createToken({ userId, username }: { userId: string, username: string }): Promise<ITokenResponse> {
    let result: ITokenResponse;
    if (userId) {
      try {
        const createResult = await this.tokenService.createToken(userId, username);
        return {
          status: HttpStatus.CREATED,
          message: '✅ Token created successfully',
          token: createResult.token,
        };
      } catch (e) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: '⚠️ Token create failed',
          token: null,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ Token create failed',
        token: null,
      };
    }
  }

  @MessagePattern('token_destroy')
  public async destroyToken({ userId }: { userId: string; }): Promise<ITokenDestroyResponse> {
    return {
      status: userId ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
      message:
        userId
          ? (await this.tokenService.deleteTokenForUserId(userId)) &&
          '✅ Token destroyed successfully'
          : '⚠️ Token destroy failed',
      errors: null,
    };
  }

  @MessagePattern('token_decode')
  public async decodeToken({ token }: { token: string; }): Promise<ITokenDataResponse> {
    const tokenData = await this.tokenService.decodeToken(token);
    return {
      status: tokenData ? HttpStatus.OK : HttpStatus.UNAUTHORIZED,
      message: tokenData ?
        '✅ Token decoded successfully' :
        '⚠️ Token decode failed',
      data: tokenData,
    };
  }
}
