import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Req,
  Inject,
  HttpStatus,
  HttpException,
  Param,
  Delete,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';

import { Authorization } from './decorators/authorization.decorator';
import { IAuthorizedRequest } from './interfaces/common/authorized-request.interface';
import { IServiceUserCreateResponse } from './interfaces/user/service-user-create-response.interface';
import { IServiceUserSearchResponse } from './interfaces/user/service-user-search-response.interface';
import { IServiveTokenCreateResponse } from './interfaces/token/service-token-create-response.interface';
import { IServiceTokenDestroyResponse } from './interfaces/token/service-token-destroy-response.interface';
import { IServiceUserConfirmResponse } from './interfaces/user/service-user-confirm-response.interface';
import { IServiceUserGetByIdResponse } from './interfaces/user/service-user-get-by-id-response.interface';

import { GetUserByTokenResponseDto } from './interfaces/user/dto/get-user-by-token-response.dto';
import { CreateUserDto } from './interfaces/user/dto/create-user.dto';
import { CreateUserResponseDto } from './interfaces/user/dto/create-user-response.dto';
import { LoginUserDto } from './interfaces/user/dto/login-user.dto';
import { LoginUserResponseDto } from './interfaces/user/dto/login-user-response.dto';
import { LogoutUserResponseDto } from './interfaces/user/dto/logout-user-response.dto';
import { ConfirmUserDto } from './interfaces/user/dto/confirm-user.dto';
import { ConfirmUserResponseDto } from './interfaces/user/dto/confirm-user-response.dto';
import { CheckUsernameAvailabilityResponseDto } from './interfaces/user/dto/check-username-availability-response.dto';
import { CheckUsernameAvailabilityDto } from './interfaces/user/dto/check-username-availability.dto';
import { IServiceUsernameUserCheckAvailabilityDtoResponse } from './interfaces/user/service-check-username-response.interface';
import { GetUserByIdDto } from './interfaces/user/dto/get-user-by-id.dto';
import { Admin } from './decorators/admin.decorator';
import { UpdateUserResponseDto } from './interfaces/user/dto/update-user-response.dto';
import { UpdateUserDto } from './interfaces/user/dto/update-user-by-id.dto';

@Controller('admin')
@ApiBearerAuth()
@ApiTags('admin')
export class AdminController {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @Inject('MEDIA_SERVICE') private readonly mediaServiceClient: ClientProxy,
  ) { }

  @Get()
  @Authorization()
  @ApiOkResponse({
    type: GetUserByTokenResponseDto,
  })
  public async getUserByToken(
    @Req() request: IAuthorizedRequest,
  ): Promise<GetUserByTokenResponseDto> {
    const { user } = request;

    const userResponse: IServiceUserGetByIdResponse = await firstValueFrom(
      this.userServiceClient.send('user_get_by_id', { id: user.id }),
    );

    return {
      message: userResponse.message,
      data: {
        user: userResponse.user,
      },
      errors: null,
    };
  }

  @Post('/users')
  @Authorization()
  @Admin()
  @ApiCreatedResponse({
    type: CreateUserResponseDto,
  })
  public async createUser(
    @Body() body: CreateUserDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<CreateUserResponseDto> {
    const createUserResponse: IServiceUserCreateResponse = await firstValueFrom(
      this.userServiceClient.send('user_create', { ...body, role: 'ROLE_ADMIN' }),
    );
    if (createUserResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: createUserResponse.message,
          data: null,
          errors: createUserResponse.errors,
        },
        createUserResponse.status,
      );
    }

    const createTokenResponse: IServiveTokenCreateResponse =
      await firstValueFrom(
        this.tokenServiceClient.send('token_create', {
          userId: createUserResponse.user.id,
          username: createUserResponse.user.username,
        }),
      );

    return {
      message: createUserResponse.message,
      data: {
        user: createUserResponse.user,
        token: createTokenResponse.token,
      },
      errors: null,
    };
  }

  @Put('/users/confirm/:id')
  @ApiCreatedResponse({
    type: UpdateUserResponseDto,
  })
  public async confirmUser(
    @Param() params: {
      id: string;
    },
  ): Promise<UpdateUserResponseDto> {
    const confirmUserResponse: IServiceUserGetByIdResponse =
      await firstValueFrom(
        this.userServiceClient.send('user_update_by_id', {
          id: params.id,
          is_confirmed: true,
        }),
      );

    if (confirmUserResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: confirmUserResponse.message,
          user: null,
        },
        confirmUserResponse.status,
      );
    }

    return {
      message: confirmUserResponse.message,
      errors: null,
      data: {
        user: confirmUserResponse.user
      },
    };
  }


  @Put('/users/:id')
  @Authorization()
  @Admin()
  @ApiCreatedResponse({
    type: UpdateUserResponseDto,
  })
  public async updateUser(
    @Param() params: {
      id: string;
    },
    @Body() body: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    const confirmUserResponse: IServiceUserGetByIdResponse =
      await firstValueFrom(
        this.userServiceClient.send('user_update_by_id', {
          id: params.id,
          ...body,
        }),
      );

    if (confirmUserResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: confirmUserResponse.message,
          user: null,
        },
        confirmUserResponse.status,
      );
    }

    return {
      message: confirmUserResponse.message,
      errors: null,
      data: {
        user: confirmUserResponse.user
      },
    };
  }

  @Delete('/users/:id')
  @Authorization()
  @Admin()
  @ApiCreatedResponse({
    type: UpdateUserResponseDto,
  })
  public async deleteUser(
    @Param() params: {
      id: string;
    },
  ): Promise<UpdateUserResponseDto> {
    const confirmUserResponse: IServiceUserGetByIdResponse =
      await firstValueFrom(
        this.userServiceClient.send('user_delete_by_id', {
          id: params.id,
        }),
      );

    if (confirmUserResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: confirmUserResponse.message,
          user: null,
        },
        confirmUserResponse.status,
      );
    }

    return {
      message: confirmUserResponse.message,
      errors: null,
      data: {
        user: confirmUserResponse.user
      },
    };
  }
}
