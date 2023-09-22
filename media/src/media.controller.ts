import { Controller, HttpStatus, StreamableFile } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { MediaService } from './services/media.service';
import { IMedia } from './interfaces/media.interface';
import { IMediaUpdateParams } from './interfaces/media-update-params.interface';
import { IMediaSearchByUserResponse } from './interfaces/media-search-by-user-response.interface';
import { IMediaDeleteResponse } from './interfaces/media-delete-response.interface';
import { IMediaCreateResponse } from './interfaces/media-create-response.interface';
import { IMediaUpdateByIdResponse } from './interfaces/media-update-by-id-response.interface';
import { IMediaSearchByIdResponse } from './interfaces/media-search-by-id-response.interface';

import * as mongoose from 'mongoose';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  @MessagePattern('media_search_by_user_id')
  public async mediaSearchByUserId(
    user_id: string,
  ): Promise<IMediaSearchByUserResponse> {
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

  @MessagePattern('media_search_by_id')
  public async mediaSearchById(
    id: string,
  ): Promise<IMediaSearchByIdResponse> {
    if (id) {
      const media = await this.mediaService.getMediaById(id);

      if (media) {
        return {
          status: HttpStatus.OK,
          message: '✅ Media found',
          media,
        };
      }
      else {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: '⚠️ Media not found',
          media: null,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ Media not found',
        media: null,
      };
    }
  }

  @MessagePattern('media_update_by_id')
  public async mediaUpdateById(params: {
    media: IMediaUpdateParams;
    id: string;
    user_id: string;
  }): Promise<IMediaUpdateByIdResponse> {
    if (params.id) {
      try {
        const media = await this.mediaService.getMediaById(params.id);
        if (media) {
          if (media.user.id.toString() === params.user_id.toString()) {
            delete media.user;
            media.user_id = params.user_id;
            const updatedMedia = await this.mediaService.updateMediaById(params.id, params.media);
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
        console.log('e', e)
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

        const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`

        body.file.originalname = body.file.originalname
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

        // if video, create thumbnail
        if (body.file.mimetype.includes('video')) {
          const thumbnail = await this.mediaService.createThumbnail(body.file);
          // body.thumbnail = thumbnail;
        }

        const uploadedFile = await this.mediaService.uploadFile(body.file);

        if (!uploadedFile?.url)
          return {
            status: HttpStatus.BAD_REQUEST,
            message: '⚠️ Media create failed',
            media: null,
            errors: null,
          };

        body.path = uploadedFile.url;
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
      const medias = await this.mediaService.getAllMedias({ limit: params.limit ?? 10, offset: params.offset ?? 0 });
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
    if (params && params.user_id && params.id) {
      try {
        const media = await this.mediaService.getMediaById(params.id);

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
