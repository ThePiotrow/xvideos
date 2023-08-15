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
    userId: string,
  ): Promise<IMediaSearchByUserResponse> {
    let result: IMediaSearchByUserResponse;

    if (userId) {
      const medias = await this.mediaService.getMediasByUserId(userId);
      result = {
        status: HttpStatus.OK,
        message: 'media_search_by_user_id_success',
        medias,
      };
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'media_search_by_user_id_bad_request',
        medias: null,
      };
    }

    return result;
  }

  @MessagePattern('media_update_by_id')
  public async mediaUpdateById(params: {
    media: IMediaUpdateParams;
    id: string;
    userId: string;
  }): Promise<IMediaUpdateByIdResponse> {
    let result: IMediaUpdateByIdResponse;
    if (params.id) {
      try {
        const media = await this.mediaService.findMediaById(params.id);
        if (media) {
          if (media.user_id === params.userId) {
            const updatedMedia = Object.assign(media, params.media);
            await updatedMedia.save();
            result = {
              status: HttpStatus.OK,
              message: 'media_update_by_id_success',
              media: updatedMedia,
              errors: null,
            };
          } else {
            result = {
              status: HttpStatus.FORBIDDEN,
              message: 'media_update_by_id_forbidden',
              media: null,
              errors: null,
            };
          }
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'media_update_by_id_not_found',
            media: null,
            errors: null,
          };
        }
      } catch (e) {
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'media_update_by_id_precondition_failed',
          media: null,
          errors: e.errors,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'media_update_by_id_bad_request',
        media: null,
        errors: null,
      };
    }

    return result;
  }

  @MessagePattern('media_create')
  public async mediaCreate(mediaBody: IMedia): Promise<IMediaCreateResponse> {
    let result: IMediaCreateResponse;

    if (mediaBody) {
      try {
        mediaBody.notification_id = null;
        mediaBody.is_solved = false;
        const media = await this.mediaService.createMedia(mediaBody);
        result = {
          status: HttpStatus.CREATED,
          message: 'media_create_success',
          media,
          errors: null,
        };
      } catch (e) {
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'media_create_precondition_failed',
          media: null,
          errors: e.errors,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'media_create_bad_request',
        media: null,
        errors: null,
      };
    }

    return result;
  }

  @MessagePattern('media_delete_by_id')
  public async mediaDeleteForUser(params: {
    userId: string;
    id: string;
  }): Promise<IMediaDeleteResponse> {
    let result: IMediaDeleteResponse;

    if (params && params.userId && params.id) {
      try {
        const media = await this.mediaService.findMediaById(params.id);

        if (media) {
          if (media.user_id === params.userId) {
            await this.mediaService.removeMediaById(params.id);
            result = {
              status: HttpStatus.OK,
              message: 'media_delete_by_id_success',
              errors: null,
            };
          } else {
            result = {
              status: HttpStatus.FORBIDDEN,
              message: 'media_delete_by_id_forbidden',
              errors: null,
            };
          }
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'media_delete_by_id_not_found',
            errors: null,
          };
        }
      } catch (e) {
        result = {
          status: HttpStatus.FORBIDDEN,
          message: 'media_delete_by_id_forbidden',
          errors: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'media_delete_by_id_bad_request',
        errors: null,
      };
    }

    return result;
  }
}
