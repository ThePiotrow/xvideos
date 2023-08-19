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
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';

import { Authorization } from './decorators/authorization.decorator';
import { Permission } from './decorators/permission.decorator';

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

@Controller('lives')
@ApiBearerAuth()
@ApiTags('lives')
export class LivesController {
  constructor(
    @Inject('LIVE_SERVICE') private readonly liveServiceClient: ClientProxy,
  ) { }

  @Get()
  @Authorization(true)
  // @Permission('live_search_by_user_id')
  @ApiOkResponse({
    type: GetLivesResponseDto,
    description: 'List of lives for signed in user',
  })
  public async getLives(
    @Req() request: IAuthorizedRequest,
  ): Promise<GetLivesResponseDto> {
    const userInfo = request.user;

    const livesResponse: IServiceLiveSearchByUserIdResponse =
      await firstValueFrom(
        this.liveServiceClient.send('live_search_by_user_id', userInfo.id),
      );

    return {
      message: livesResponse.message,
      data: {
        lives: livesResponse.lives,
      },
      errors: null,
    };
  }

  @Post()
  @Authorization(true)
  @Permission('live_create')
  @ApiCreatedResponse({
    type: CreateLiveResponseDto,
  })
  public async createLive(
    @Req() request: IAuthorizedRequest,
    @Body() liveRequest: CreateLiveDto,
  ): Promise<CreateLiveResponseDto> {
    const userInfo = request.user;
    const createLiveResponse: IServiceLiveCreateResponse =
      await firstValueFrom(
        this.liveServiceClient.send(
          'live_create',
          Object.assign(liveRequest, { user_id: userInfo.id }),
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
  @Authorization(true)
  @Permission('live_delete_by_id')
  @ApiOkResponse({
    type: DeleteLiveResponseDto,
  })
  public async deleteLive(
    @Req() request: IAuthorizedRequest,
    @Param() params: LiveIdDto,
  ): Promise<DeleteLiveResponseDto> {
    const userInfo = request.user;

    const deleteLiveResponse: IServiceLiveDeleteResponse =
      await firstValueFrom(
        this.liveServiceClient.send('live_delete_by_id', {
          id: params.id,
          userId: userInfo.id,
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

  @Put(':id')
  @Authorization(true)
  @Permission('live_update_by_id')
  @ApiOkResponse({
    type: UpdateLiveResponseDto,
  })
  public async updateLive(
    @Req() request: IAuthorizedRequest,
    @Param() params: LiveIdDto,
    @Body() liveRequest: UpdateLiveDto,
  ): Promise<UpdateLiveResponseDto> {
    const userInfo = request.user;
    const updateLiveResponse: IServiceLiveUpdateByIdResponse =
      await firstValueFrom(
        this.liveServiceClient.send('live_update_by_id', {
          id: params.id,
          userId: userInfo.id,
          live: liveRequest,
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
