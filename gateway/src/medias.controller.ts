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
import { IServiceMediaCreateResponse } from './interfaces/media/service-media-create-response-interface';
import { IServiceMediaDeleteResponse } from './interfaces/media/service-media-delete-response.interface';
import { IServiceMediaSearchByUserIdResponse } from './interfaces/media/service-media-search-by-user-id-response.interface';
import { IServiceMediaUpdateByIdResponse } from './interfaces/media/service-media-update-by-id-response.interface';
import { GetMediasResponseDto } from './interfaces/media/dto/get-medias-response.dto';
import { CreateMediaResponseDto } from './interfaces/media/dto/create-media-response.dto';
import { DeleteMediaResponseDto } from './interfaces/media/dto/delete-media-response.dto';
import { UpdateMediaResponseDto } from './interfaces/media/dto/update-media-response.dto';
import { CreateMediaDto } from './interfaces/media/dto/create-media.dto';
import { UpdateMediaDto } from './interfaces/media/dto/update-media.dto';
import { MediaIdDto } from './interfaces/media/dto/media-id.dto';

@Controller('medias')
@ApiBearerAuth()
@ApiTags('medias')
export class MediasController {
  constructor(
    @Inject('MEDIA_SERVICE') private readonly mediaServiceClient: ClientProxy,
  ) { }

  @Get()
  @Authorization(true)
  @Permission('media_search_by_user_id')
  @ApiOkResponse({
    type: GetMediasResponseDto,
    description: 'List of medias for signed in user',
  })
  public async getMedias(
    @Req() request: IAuthorizedRequest,
  ): Promise<GetMediasResponseDto> {
    const userInfo = request.user;

    const mediasResponse: IServiceMediaSearchByUserIdResponse =
      await firstValueFrom(
        this.mediaServiceClient.send('media_search_by_user_id', userInfo.id),
      );

    return {
      message: mediasResponse.message,
      data: {
        medias: mediasResponse.medias,
      },
      errors: null,
    };
  }

  @Post()
  @Authorization(true)
  @Permission('media_create')
  @ApiCreatedResponse({
    type: CreateMediaResponseDto,
  })
  public async createMedia(
    @Req() request: IAuthorizedRequest,
    @Body() mediaRequest: CreateMediaDto,
  ): Promise<CreateMediaResponseDto> {
    const userInfo = request.user;
    const createMediaResponse: IServiceMediaCreateResponse =
      await firstValueFrom(
        this.mediaServiceClient.send(
          'media_create',
          Object.assign(mediaRequest, { user_id: userInfo.id }),
        ),
      );

    if (createMediaResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: createMediaResponse.message,
          data: null,
          errors: createMediaResponse.errors,
        },
        createMediaResponse.status,
      );
    }

    return {
      message: createMediaResponse.message,
      data: {
        media: createMediaResponse.media,
      },
      errors: null,
    };
  }

  @Delete(':id')
  @Authorization(true)
  @Permission('media_delete_by_id')
  @ApiOkResponse({
    type: DeleteMediaResponseDto,
  })
  public async deleteMedia(
    @Req() request: IAuthorizedRequest,
    @Param() params: MediaIdDto,
  ): Promise<DeleteMediaResponseDto> {
    const userInfo = request.user;

    const deleteMediaResponse: IServiceMediaDeleteResponse =
      await firstValueFrom(
        this.mediaServiceClient.send('media_delete_by_id', {
          id: params.id,
          userId: userInfo.id,
        }),
      );

    if (deleteMediaResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: deleteMediaResponse.message,
          errors: deleteMediaResponse.errors,
          data: null,
        },
        deleteMediaResponse.status,
      );
    }

    return {
      message: deleteMediaResponse.message,
      data: null,
      errors: null,
    };
  }

  @Put(':id')
  @Authorization(true)
  @Permission('media_update_by_id')
  @ApiOkResponse({
    type: UpdateMediaResponseDto,
  })
  public async updateMedia(
    @Req() request: IAuthorizedRequest,
    @Param() params: MediaIdDto,
    @Body() mediaRequest: UpdateMediaDto,
  ): Promise<UpdateMediaResponseDto> {
    const userInfo = request.user;
    const updateMediaResponse: IServiceMediaUpdateByIdResponse =
      await firstValueFrom(
        this.mediaServiceClient.send('media_update_by_id', {
          id: params.id,
          userId: userInfo.id,
          media: mediaRequest,
        }),
      );

    if (updateMediaResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: updateMediaResponse.message,
          errors: updateMediaResponse.errors,
          data: null,
        },
        updateMediaResponse.status,
      );
    }

    return {
      message: updateMediaResponse.message,
      data: {
        media: updateMediaResponse.media,
      },
      errors: null,
    };
  }
}
