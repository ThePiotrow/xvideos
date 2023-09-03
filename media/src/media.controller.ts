import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { MediaService } from './services/media.service';
import { IMedia } from './interfaces/media.interface';
import { IMediaUpdateParams } from './interfaces/media-update-params.interface';
import { IMediaSearchByUserResponse } from './interfaces/media-search-by-user-response.interface';
import { IMediaDeleteResponse } from './interfaces/media-delete-response.interface';
import { IMediaCreateResponse } from './interfaces/media-create-response.interface';
import { IMediaUpdateByIdResponse } from './interfaces/media-update-by-id-response.interface';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  @MessagePattern('media_search_by_user_id')
  public async mediaSearchByUserId(
    user_id: string,
  ): Promise<IMediaSearchByUserResponse> {
    let result: IMediaSearchByUserResponse;

    if (user_id) {
      const medias = await this.mediaService.getMediasByUserId(user_id);
      return {
        status: HttpStatus.OK,
        message: '✅ Medias found',
        medias,
      };
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ Medias not found',
        medias: null,
      };
    }
  }

  @MessagePattern('media_update_by_id')
  public async mediaUpdateById(params: {
    media: IMediaUpdateParams;
    id: string;
    user_id: string;
  }): Promise<IMediaUpdateByIdResponse> {
    let result: IMediaUpdateByIdResponse;
    if (params.id) {
      try {
        const media = await this.mediaService.findMediaById(params.id);
        if (media) {
          if (media.user_id.toString() === params.user_id.toString()) {
            const updatedMedia = Object.assign(media, params.media);
            await updatedMedia.save();
            return {
              status: HttpStatus.OK,
              message: '✅ Media updated',
              media: updatedMedia,
              errors: null,
            };
          } else {
            return {
              status: HttpStatus.FORBIDDEN,
              message: '⛔ Forbidden',
              media: null,
              errors: null,
            };
          }
        } else {
          return {
            status: HttpStatus.NOT_FOUND,
            message: '⚠️ Media not found',
            media: null,
            errors: null,
          };
        }
      } catch (e) {
        return {
          status: HttpStatus.PRECONDITION_FAILED,
          message: '⚠️ Media update failed',
          media: null,
          errors: e.errors,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ Media update failed',
        media: null,
        errors: null,
      };
    }
  }

  @MessagePattern('media_create')
  public async mediaCreate(body: IMedia): Promise<IMediaCreateResponse> {

    if (body && body.file) {
      try {

        const folder = 'uploads';
        const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`

        body.path = body.file.originalname
          .replace(/(\.[^\.]+)$/, `-${suffix}$1`)
          .replace(/[^a-zA-Z0-9-.]/g, '-');

        if (!body.file.mimetype.includes('image') && !body.file.mimetype.includes('video')) {
          return {
            status: HttpStatus.BAD_REQUEST,
            message: '🚫 Media type not allowed',
            media: null,
            errors: null,
          };
        }

        if (!this.mediaService.createFile(`./${folder}/${body.path}`, body.data))
          return {
            status: HttpStatus.BAD_REQUEST,
            message: '⚠️ Media create failed',
            media: null,
            errors: null,
          };

        const media = await this.mediaService.createMedia(body);
        return {
          status: HttpStatus.CREATED,
          message: '✅ Media created',
          media,
          errors: null,
        };

      } catch (e) {
        return {
          status: HttpStatus.PRECONDITION_FAILED,
          message: '⚠️ Media create failed',
          media: null,
          errors: e.errors,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ Media create failed',
        media: null,
        errors: null,
      };
    }
  }

  @MessagePattern('media_get_all')
  public async mediaGetAll(
    params: {
      limit: number;
      offset: number;
    }
  ): Promise<IMediaSearchByUserResponse> {
    try {
      const medias = await this.mediaService.getAllMedias({ limit: params.limit, offset: params.offset });
      return {
        status: HttpStatus.OK,
        message: '✅ Medias found',
        medias,
      };
    }
    catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ Medias not found',
        medias: null,
      };
    }
  }

  @MessagePattern('media_delete_by_id')
  public async mediaDeleteForUser(params: {
    user_id: string;
    id: string;
  }): Promise<IMediaDeleteResponse> {
    let result: IMediaDeleteResponse;

    if (params && params.user_id && params.id) {
      try {
        const media = await this.mediaService.findMediaById(params.id);

        if (media) {
          if (media.user_id === params.user_id) {
            await this.mediaService.removeMediaById(params.id);
            return {
              status: HttpStatus.OK,
              message: '✅ Media deleted',
              errors: null,
            };
          } else {
            return {
              status: HttpStatus.FORBIDDEN,
              message: '⛔ Forbidden',
              errors: null,
            };
          }
        } else {
          return {
            status: HttpStatus.NOT_FOUND,
            message: '⚠️ Media not found',
            errors: null,
          };
        }
      } catch (e) {
        return {
          status: HttpStatus.FORBIDDEN,
          message: '⚠️ Media delete failed',
          errors: null,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ Media delete failed',
        errors: null,
      };
    }
  }
}
