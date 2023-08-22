import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { MediaService } from './services/media.service';
import { IMedia } from './interfaces/media.interface';
import { IMediaUpdateParams } from './interfaces/media-update-params.interface';
import { IMediaSearchByUserResponse } from './interfaces/media-search-by-user-response.interface';
import { IMediaDeleteResponse } from './interfaces/media-delete-response.interface';
import { IMediaCreateResponse } from './interfaces/media-create-response.interface';
import { IMediaUpdateByIdResponse } from './interfaces/media-update-by-id-response.interface';

import * as fs from 'node:fs';

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
      return {
        status: HttpStatus.OK,
        message: 'media_search_by_user_id_success',
        medias,
      };
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'media_search_by_user_id_bad_request',
        medias: null,
      };
    }
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
          if (media.user_id.toString() === params.userId.toString()) {
            const updatedMedia = Object.assign(media, params.media);
            await updatedMedia.save();
            return {
              status: HttpStatus.OK,
              message: 'media_update_by_id_success',
              media: updatedMedia,
              errors: null,
            };
          } else {
            return {
              status: HttpStatus.FORBIDDEN,
              message: 'media_update_by_id_forbidden',
              media: null,
              errors: null,
            };
          }
        } else {
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'media_update_by_id_not_found',
            media: null,
            errors: null,
          };
        }
      } catch (e) {
        return {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'media_update_by_id_precondition_failed',
          media: null,
          errors: e.errors,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'media_update_by_id_bad_request',
        media: null,
        errors: null,
      };
    }
  }

  @MessagePattern('media_create')
  public async mediaCreate(body: IMedia): Promise<IMediaCreateResponse> {

    console.log(body)

    if (body && body.file) {
      try {

        const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`

        const file = {
          ...body.file,
          name: `${body.file.originalname.replace(/(\.[^\.]+)$/, `-${suffix}$1`).replace(/\s/g, '-')}`,
        };

        console.log(body.file.originalname.replace(/(\.[^\.]+)$/, `-${suffix}$1`).replace(/\s/g, '-'))

        if (!file.mimetype.includes('image') && !file.mimetype.includes('video')) {
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'media_create_bad_request_media_type',
            media: null,
            errors: null,
          };
        }

        const folder = 'uploads';

        // fs.writeFile(`./${folder}/${file.name}`, file.buffer.toString(), (err) => {
        //   if (err) console.log(err);
        //   console.log("The file has been saved!");
        // });

        const media = await this.mediaService.createMedia(body);
        return {
          status: HttpStatus.CREATED,
          message: 'media_create_success',
          media,
          errors: null,
        };
      } catch (e) {
        return {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'media_create_precondition_failed',
          media: null,
          errors: e.errors,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'media_create_bad_request',
        media: null,
        errors: null,
      };
    }
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
            return {
              status: HttpStatus.OK,
              message: 'media_delete_by_id_success',
              errors: null,
            };
          } else {
            return {
              status: HttpStatus.FORBIDDEN,
              message: 'media_delete_by_id_forbidden',
              errors: null,
            };
          }
        } else {
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'media_delete_by_id_not_found',
            errors: null,
          };
        }
      } catch (e) {
        return {
          status: HttpStatus.FORBIDDEN,
          message: 'media_delete_by_id_forbidden',
          errors: null,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'media_delete_by_id_bad_request',
        errors: null,
      };
    }
  }
}
