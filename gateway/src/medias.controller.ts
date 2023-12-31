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
  Query,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

import { Authorization } from './decorators/authorization.decorator';

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
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { IServiceMediaSearchByIdResponse } from './interfaces/media/service-media-search-by-id-response.interface';
import { GetMediaResponseDto } from './interfaces/media/dto/get-media-response.dto';
import { Owner } from './decorators/owner.decorator';
import { IMedia } from './interfaces/media/media.interface';

@Controller('medias')
@ApiBearerAuth()
@ApiTags('medias')
export class MediasController {
  constructor(
    @Inject('MEDIA_SERVICE') private readonly mediaServiceClient: ClientProxy,
  ) { }

  @Get('/:id')
  @ApiOkResponse({
    type: GetMediaResponseDto,
  })
  public async getMediaById(
    @Param() params: MediaIdDto,
  ): Promise<GetMediaResponseDto> {
    const mediasResponse: IServiceMediaSearchByIdResponse =
      await firstValueFrom(
        this.mediaServiceClient.send('media_search_by_id', { id: params.id }),
      );

    return {
      message: mediasResponse.message,
      data: {
        media: mediasResponse.media,
      },
      errors: null,
    };
  }

  @Get()
  @ApiOkResponse({
    type: GetMediasResponseDto,
  })
  public async getMedias(
    @Query() body: { limit?: number; page?: number; },
  ): Promise<GetMediasResponseDto> {

    const limit = Math.max(1, body.limit)
    const offset = limit * (Math.max(1, body.page) - 1);

    const mediasResponse: IServiceMediaSearchByUserIdResponse =
      await firstValueFrom(
        this.mediaServiceClient.send('media_get_all', {
          limit: limit,
          offset: offset,
          all: false,
          is_deleted: false,
          allUser: false,
          isConfirmed: true,
        }),
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

  @Post()
  @Authorization()
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'media', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ],
  ))
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    type: CreateMediaResponseDto,
  })
  public async createMedia(
    @Req() request: IAuthorizedRequest,
    @Body() body: CreateMediaDto,
    @UploadedFiles() files: { media?: Express.Multer.File[], thumbnail?: Express.Multer.File[] },
  ): Promise<CreateMediaResponseDto> {
    const { user } = request;

    const media: IMedia = Object.assign(
      body,
      {
        user_id: user.id,
        media: files.media[0],
        thumbnail: files.thumbnail ? files.thumbnail[0] : null,
      }
    );

    const createMediaResponse: IServiceMediaCreateResponse =
      await firstValueFrom(
        this.mediaServiceClient.send(
          'media_create',
          media
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
  @Authorization()
  @Owner('media')
  @ApiOkResponse({
    type: DeleteMediaResponseDto,
  })
  public async deleteMedia(
    @Req() request: IAuthorizedRequest,
    @Param() params: MediaIdDto,
  ): Promise<DeleteMediaResponseDto> {
    const { resource } = request;

    const deleteMediaResponse: IServiceMediaDeleteResponse =
      await firstValueFrom(
        this.mediaServiceClient.send('media_delete_by_id', {
          id: params.id,
          media: resource,
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
  @Authorization()
  @Owner('media')
  @ApiOkResponse({
    type: UpdateMediaResponseDto,
  })
  public async updateMedia(
    @Req() request: IAuthorizedRequest,
    @Param() params: MediaIdDto,
    @Body() body: UpdateMediaDto,
  ): Promise<UpdateMediaResponseDto> {
    const { resource } = request;

    const updateMediaResponse: IServiceMediaUpdateByIdResponse =
      await firstValueFrom(
        this.mediaServiceClient.send('media_update_by_id', {
          id: params.id,
          user_id: resource.user.id,
          media: body,
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
