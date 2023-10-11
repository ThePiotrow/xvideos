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
  Query,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';

import { Authorization } from './decorators/authorization.decorator';
import { IAuthorizedRequest } from './interfaces/common/authorized-request.interface';
import { IServiceUserCreateResponse } from './interfaces/user/service-user-create-response.interface';
import { IServiveTokenCreateResponse } from './interfaces/token/service-token-create-response.interface';
import { IServiceUserGetByIdResponse } from './interfaces/user/service-user-get-by-id-response.interface';

import { GetUserByTokenResponseDto } from './interfaces/user/dto/get-user-by-token-response.dto';
import { CreateUserDto } from './interfaces/user/dto/create-user.dto';
import { CreateUserResponseDto } from './interfaces/user/dto/create-user-response.dto';
import { Admin } from './decorators/admin.decorator';
import { UpdateUserResponseDto } from './interfaces/user/dto/update-user-response.dto';
import { UpdateUserDto } from './interfaces/user/dto/update-user-by-id.dto';
import { GetMediaResponseDto } from './interfaces/media/dto/get-media-response.dto';
import { IServiceMediaSearchByIdResponse } from './interfaces/media/service-media-search-by-id-response.interface';
import { MediaIdDto } from './interfaces/media/dto/media-id.dto';
import { UpdateMediaDto } from './interfaces/media/dto/update-media.dto';
import { UpdateMediaResponseDto } from './interfaces/media/dto/update-media-response.dto';
import { IServiceMediaUpdateByIdResponse } from './interfaces/media/service-media-update-by-id-response.interface';

@Controller('admin')
@ApiBearerAuth()
@ApiTags('admin')
export class AdminController {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @Inject('MEDIA_SERVICE') private readonly mediaServiceClient: ClientProxy,
    @Inject('LIVE_SERVICE') private readonly liveServiceClient: ClientProxy,
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

  @Get('medias')
  @Authorization()
  @Admin()
  @ApiOkResponse({
    type: GetMediaResponseDto,
  })
  public async getMedias(
    @Query() body: { limit?: number; page?: number; },
  ): Promise<any> {
    const limit = Math.max(1, body.limit ?? 1)
    const offset = limit * (Math.max(1, body.page ?? 1) - 1);
    const mediasResponse: any =
      await firstValueFrom(
        this.mediaServiceClient.send('media_get_all',
          {
            limit: limit,
            offset: offset,
            all: true
          }
        ),
      );

    return {
      message: mediasResponse.message,
      data: {
        medias: mediasResponse.medias,
        total: mediasResponse.total,
      },
      errors: null,
    };
  }

  @Get('medias/:id')
  @Authorization()
  @Admin()
  @ApiOkResponse({
    type: GetMediaResponseDto,
  })
  public async getMediaById(
    @Param() params: MediaIdDto,
  ): Promise<GetMediaResponseDto> {
    const mediasResponse: IServiceMediaSearchByIdResponse =
      await firstValueFrom(
        this.mediaServiceClient.send('media_get_all',
          {
            id: params.id,
            all: true
          }
        ),
      );

    return {
      message: mediasResponse.message,
      data: {
        media: mediasResponse.media,
      },
      errors: null,
    };
  }

  @Put('/medias/:id')
  @Authorization()
  @Admin()
  @ApiCreatedResponse({
    type: UpdateMediaResponseDto,
  })
  public async updateMedia(
    @Param() params: {
      id: string;
    },
    @Body() body: UpdateMediaDto,
  ): Promise<UpdateMediaResponseDto> {
    console.log(params.id, body)
    const confirmMediaResponse: IServiceMediaUpdateByIdResponse =
      await firstValueFrom(
        this.mediaServiceClient.send('media_update_by_id', {
          id: params.id,
          media: body,
        }),
      );

    if (confirmMediaResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: confirmMediaResponse.message,
          media: null,
        },
        confirmMediaResponse.status,
      );
    }

    return {
      message: confirmMediaResponse.message,
      errors: null,
      data: {
        media: confirmMediaResponse.media,
      },
    };
  }

  @Get('/users')
  @Authorization()
  @Admin()
  public async getUsers(
    @Query() body: { limit?: number; page?: number; },
  ): Promise<any> {
    const limit = Math.max(1, body.limit ?? 1)
    const offset = limit * (Math.max(1, body.page ?? 1) - 1);

    const usersResponse: any =
      await firstValueFrom(
        this.userServiceClient.send('user_get_all', {
          offset: offset,
          limit: limit,
          all: true
        }),
      );

    console.log("user limit : ", limit)

    if (usersResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: usersResponse.message,
          user: null,
        },
        usersResponse.status,
      );
    }

    return {
      message: usersResponse.message,
      errors: null,
      data: {
        users: usersResponse.users,
        total: usersResponse.total,
      },
    };
  }

  @Get('/lives')
  @Authorization()
  @Admin()
  public async getAdminLives(
    @Query() body: { limit?: number; page?: number; },
  ): Promise<any> {
    const limit = Math.max(1, body.limit)
    const offset = limit * (Math.max(1, body.page) - 1);

    const livesResponse: any =
      await firstValueFrom(
        this.liveServiceClient.send('get_all_lives',
          {
            limit: limit,
            offset: offset,
            all: true
          }
        ),
      );

    return {
      message: livesResponse.message,
      data: {
        lives: livesResponse.lives,
        total: livesResponse.total,
      },
      errors: null,
    };
  }
}
