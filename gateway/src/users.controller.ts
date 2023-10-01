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
import { GetAllUsersResponseDto } from './interfaces/user/dto/get-all-users-response.dto';
import { IUserGetAllResponse } from './interfaces/user/user-get-all-response.interface';
import { GetUserByUsernameDto } from './interfaces/user/dto/get-user-by-username.dto';

@Controller('users')
@ApiBearerAuth()
@ApiTags('users')
export class UsersController {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) { }

  @Get('/me')
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

  @Get()
  @ApiOkResponse({
    type: GetAllUsersResponseDto,
  })
  public async getAllUsers(
    @Req() request: IAuthorizedRequest,
  ): Promise<GetAllUsersResponseDto> {

    const usersResponse: IUserGetAllResponse = await firstValueFrom(
      this.userServiceClient.send('user_get_all', {}),
    );

    return {
      message: usersResponse.message,
      data: {
        users: usersResponse.users,
      },
      errors: null,
    };
  }

  @Post()
  @ApiCreatedResponse({
    type: CreateUserResponseDto,
  })
  public async createUser(
    @Body() body: CreateUserDto,
    @Req() request: IAuthorizedRequest,
  ): Promise<CreateUserResponseDto> {
    const createUserResponse: IServiceUserCreateResponse = await firstValueFrom(
      this.userServiceClient.send('user_create', { ...body, role: 'ROLE_USER' }),


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

  @Post('/login')
  @ApiCreatedResponse({
    type: LoginUserResponseDto,
  })
  public async loginUser(
    @Body() body: LoginUserDto,
  ): Promise<LoginUserResponseDto> {
    const getUserResponse: IServiceUserSearchResponse = await firstValueFrom(
      this.userServiceClient.send('user_search_by_credentials', body),
    );

    if (getUserResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: getUserResponse.message,
          data: null,
          errors: null,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const createTokenResponse: IServiveTokenCreateResponse =
      await firstValueFrom(
        this.tokenServiceClient.send('token_create', {
          userId: getUserResponse.user.id,
          username: getUserResponse.user.username,
        }),
      );

    return {
      message: createTokenResponse.message,
      data: {
        token: createTokenResponse.token,
      },
      errors: null,
    };
  }

  @Put('/logout')
  @Authorization()
  @ApiCreatedResponse({
    type: LogoutUserResponseDto,
  })
  public async logoutUser(
    @Req() request: IAuthorizedRequest,
  ): Promise<LogoutUserResponseDto> {
    const { user } = request;

    const destroyTokenResponse: IServiceTokenDestroyResponse =
      await firstValueFrom(
        this.tokenServiceClient.send('token_destroy', {
          userId: user.id,
        }),
      );

    if (destroyTokenResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: destroyTokenResponse.message,
          data: null,
          errors: destroyTokenResponse.errors,
        },
        destroyTokenResponse.status,
      );
    }

    return {
      message: destroyTokenResponse.message,
      errors: null,
      data: null,
    };
  }

  @Get('/username/check-availability/:username')
  @ApiOkResponse({
    type: CheckUsernameAvailabilityResponseDto,
  })
  public async checkUsernameUsernameAvailability(
    @Param() params: CheckUsernameAvailabilityDto,
  ): Promise<CheckUsernameAvailabilityResponseDto> {
    const getUserResponse: IServiceUsernameUserCheckAvailabilityDtoResponse = await firstValueFrom(
      this.userServiceClient.send('user_username_check_availability', {
        username: params.username,
      }),
    );

    if (getUserResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: getUserResponse.message,
          data: null,

          errors: getUserResponse.errors,
        },
        getUserResponse.status,
      );
    }

    return {
      message: getUserResponse.message,
      data: {
        available: getUserResponse.available,
      },

      errors: null,
    };
  }

  @Get('/confirm/:link')
  @ApiCreatedResponse({
    type: ConfirmUserResponseDto,
  })
  public async confirmUser(
    @Param() params: ConfirmUserDto,
  ): Promise<ConfirmUserResponseDto> {
    const confirmUserResponse: IServiceUserConfirmResponse =
      await firstValueFrom(
        this.userServiceClient.send('user_confirm', {
          link: params.link,
        }),
      );

    if (confirmUserResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: confirmUserResponse.message,
          data: null,
          errors: confirmUserResponse.errors,
        },
        confirmUserResponse.status,
      );
    }

    return {
      message: confirmUserResponse.message,
      errors: null,
      data: null,
    };
  }

  @Get('/:id')
  @ApiOkResponse({
    type: GetUserByTokenResponseDto,
  })
  public async getUserById(
    @Param() params: GetUserByIdDto,
  ): Promise<GetUserByTokenResponseDto> {

    const userResponse: IServiceUserGetByIdResponse = await firstValueFrom(
      this.userServiceClient.send('user_get_by_id', { id: params.id, media: false }),
    );

    return {
      message: userResponse.message,
      data: {
        user: userResponse.user,
      },
      errors: null,
    };
  }

  @Get('/live/:username')
  @ApiOkResponse({
    type: GetUserByTokenResponseDto,
  })
  public async getUserByUsername(
    @Param() params: GetUserByUsernameDto,
  ): Promise<GetUserByTokenResponseDto> {

    const userResponse: IServiceUserGetByIdResponse = await firstValueFrom(
      this.userServiceClient.send('user_get_by_username', { username: params.username, media: false }),
    );

    return {
      message: userResponse.message,
      data: {
        user: userResponse.user,
      },
      errors: null,
    };
  }

  @Get('/:id/medias')
  @ApiOkResponse({
    type: GetUserByTokenResponseDto,
  })
  public async getUserByIdWithMedias(
    @Param() params: GetUserByIdDto,
  ): Promise<GetUserByTokenResponseDto> {

    const userResponse: IServiceUserGetByIdResponse = await firstValueFrom(
      this.userServiceClient.send('user_get_by_id', { id: params.id, media: true }),
    );

    return {
      message: userResponse.message,
      data: {
        user: userResponse.user,
      },
      errors: null,
    };
  }
}
