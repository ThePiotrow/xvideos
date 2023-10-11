import {
  Controller,
  Inject,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  Patch,
  Query,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { Authorization } from './decorators/authorization.decorator';

import { IAuthorizedRequest } from './interfaces/common/authorized-request.interface';
import { IServiceLiveCreateResponse } from './interfaces/live/service-live-create-response-interface';
import { IServiceLiveDeleteResponse } from './interfaces/live/service-live-delete-response.interface';
import { IServiceLiveSearchByUserIdResponse } from './interfaces/live/service-live-search-by-user-id-response.interface';
import { IServiceLiveUpdateByIdResponse } from './interfaces/live/service-live-update-by-id-response.interface';
import { GetLivesResponseDto } from './interfaces/live/dto/get-lives-response.dto';
import { CreateLiveResponseDto } from './interfaces/live/dto/create-live-response.dto';
import { DeleteLiveResponseDto } from './interfaces/live/dto/delete-live-response.dto';
import { UpdateLiveResponseDto } from './interfaces/live/dto/update-live-response.dto';
import { CreateLiveDto } from './interfaces/live/dto/create-live.dto';
import { UpdateLiveDto } from './interfaces/live/dto/update-live.dto';
import { LiveIdDto } from './interfaces/live/dto/live-id.dto';
import { Owner } from './decorators/owner.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('lives')
@ApiBearerAuth()
@ApiTags('lives')
export class LivesController {
  constructor(
    @Inject('LIVE_SERVICE') private readonly liveServiceClient: ClientProxy,
  ) { }

  @Get()
  @ApiOkResponse({
    type: GetLivesResponseDto,
  })
  public async getLives(
    @Query() body: { limit?: number; page?: number },
  ): Promise<GetLivesResponseDto> {
    const limit = Math.max(1, body.limit);
    const offset = limit * (Math.max(1, body.page) - 1);

    const livesResponse: IServiceLiveSearchByUserIdResponse =
      await firstValueFrom(
        this.liveServiceClient.send('get_all_lives', {
          limit: limit,
          offset: offset,
        }),
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

  @Post()
  @Authorization()
  @ApiCreatedResponse({
    type: CreateLiveResponseDto,
  })
  public async createLive(
    @Req() request: IAuthorizedRequest,
    @Body() body: CreateLiveDto,
  ): Promise<CreateLiveResponseDto> {
    const { user } = request;
    const createLiveResponse: IServiceLiveCreateResponse =
      await firstValueFrom(
        this.liveServiceClient.send(
          'live_create',
          Object.assign(body, { user_id: user.id }),
        ),
      );

    if (createLiveResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: createLiveResponse.message,
          data: null,
          errors: createLiveResponse.errors,
        },
        createLiveResponse.status,
      );
    }

    return {
      message: createLiveResponse.message,
      data: {
        live: createLiveResponse.live,
      },
      errors: null,
    };
  }


  @Delete(':id')
  @Authorization()
  @Owner('live')
  @ApiOkResponse({
    type: DeleteLiveResponseDto,
  })
  public async deleteLive(
    @Req() request: IAuthorizedRequest,
    @Param() params: LiveIdDto,
  ): Promise<DeleteLiveResponseDto> {
    const { user } = request;

    const deleteLiveResponse: IServiceLiveDeleteResponse =
      await firstValueFrom(
        this.liveServiceClient.send('live_delete_by_id', {
          id: params.id,
          userId: user.id,
        }),
      );

    if (deleteLiveResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: deleteLiveResponse.message,
          errors: deleteLiveResponse.errors,
          data: null,
        },
        deleteLiveResponse.status,
      );
    }

    return {
      message: deleteLiveResponse.message,
      data: null,
      errors: null,
    };
  }

  @Patch(':id')
  @Authorization()
  @Owner('live')
  @ApiOkResponse({
    type: UpdateLiveResponseDto,
  })
  public async updateLive(
    @Req() request: IAuthorizedRequest,
    @Param() params: LiveIdDto,
    @Body() live: UpdateLiveDto,
  ): Promise<UpdateLiveResponseDto> {
    const { user } = request;

    const updateLiveResponse: IServiceLiveUpdateByIdResponse =
      await firstValueFrom(
        this.liveServiceClient.send('live_update_by_id', {
          id: params.id,
          live,
          all: true
        }),
      );

    if (updateLiveResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: updateLiveResponse.message,
          errors: updateLiveResponse.errors,
          data: null,
        },
        updateLiveResponse.status,
      );
    }

    return {
      message: updateLiveResponse.message,
      data: {
        live: updateLiveResponse.live,
      },
      errors: null,
    };
  }

  @Get(':id')
  @Authorization()
  @Owner('live')
  @ApiOkResponse({
    type: UpdateLiveResponseDto,
  })
  public async getLive(
    @Req() request: IAuthorizedRequest,
    @Param() params: LiveIdDto,
  ): Promise<UpdateLiveResponseDto> {
    const { user } = request;
    const updateLiveResponse: IServiceLiveUpdateByIdResponse =
      await firstValueFrom(
        this.liveServiceClient.send('live_search_by_id', {
          id: params.id,
          userId: user.id,
        }),
      );

    if (updateLiveResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: updateLiveResponse.message,
          errors: updateLiveResponse.errors,
          data: null,
        },
        updateLiveResponse.status,
      );
    }

    return {
      message: updateLiveResponse.message,
      data: {
        live: updateLiveResponse.live,
      },
      errors: null,
    };
  }
}
