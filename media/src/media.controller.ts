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

import * as ffmpeg from 'fluent-ffmpeg';

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
  public async mediaSearchById(params: {
    id: string;
    all?: boolean;
    is_deleted?: boolean;
    allUser?: boolean;
    isConfirmed?: boolean;
  }): Promise<IMediaSearchByIdResponse> {
    if (params.id) {
      const media = await this.mediaService.getMediaById(params);

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
        let media = await this.mediaService.getMediaById({ id: params.id, all: true });
        if (media) {
          media.user_id = media.user.id;
          media = { ...media, ...params.media } as IMedia;

          delete media.user;
          const updatedMedia = await this.mediaService.updateMediaById(
            params.id,
            params.media,
          );
          return {
            status: HttpStatus.OK,
            message: '✅ Media updated',
            media: updatedMedia,
            errors: null,
          };
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
    if (body && body.media) {
      try {
        const types = {
          media: body.media.mimetype.split('/')[0],
          thumbnail: body.thumbnail ? body.thumbnail.mimetype.split('/')[0] : null,
        };

        let urls = {
          original: null,
          thumbnail: null,
          hls: null,
        };

        if (!['image', 'video'].includes(types.media) || (body.thumbnail && !['image'].includes(types.thumbnail))) {
          return {
            status: HttpStatus.BAD_REQUEST,
            message: '🚫 Media type not allowed',
            media: null,
            errors: null,
          };
        }

        const original = await this.mediaService.uploadFile(body.media);
        if (!original || !original?.url) {
          return {
            status: HttpStatus.BAD_REQUEST,
            message: '⚠️ Media create failed',
            media: null,
            errors: null,
          };
        }

        urls.original = original.url;

        if (types.media === 'image') {
          urls.thumbnail = original.url;
        }

        if (types.media === 'video') {
          const { duration, height } = await new Promise<{ duration: number; height: any }>((resolve, reject) => {
            ffmpeg.ffprobe(original.url, (err, metadata) => {
              if (err) reject(err);
              else {
                console.log(metadata.format)
                const height = metadata.streams.find(stream => stream.height)?.height;
                const duration = metadata.format.duration;

                resolve({
                  duration,
                  height
                })
              };
            });
          });

          body.duration = duration;

          const thumbnail = body.thumbnail
            ? await this.mediaService.uploadFile(body.thumbnail)
            : await this.mediaService.generateThumbnail({ ...original, mimetype: body.media?.mimetype, duration });
          urls.thumbnail = thumbnail.url;

          const streams = [
            180,
            270,
            360,
            540,
            720,
            1080,
          ];
          const resolutions = streams.filter(stream => stream <= height);
          const videoData = await this.mediaService.generateVideo({ ...original, mimetype: body.media.mimetype }, resolutions);

          urls.hls = videoData.url;
        }

        body.urls = urls;
        body.type = types.media as 'image' | 'video';

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
      all: boolean;
      is_deleted: boolean;
      limit: number;
      offset: number;
      allUser: boolean;
      isConfirmed: boolean;
      userId: string;
    }
  ): Promise<IMediaSearchByUserResponse> {
    try {
      const medias = await this.mediaService.getAllMedias({
        all: params.all ?? false,
        is_deleted: params.is_deleted ?? false,
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
        allUser: params.allUser ?? false,
        isConfirmed: params.isConfirmed ?? true,
        userId: params.userId ?? null,
      });
      const total = await this.mediaService.count()
      return {
        status: HttpStatus.OK,
        message: '✅ Medias found',
        medias,
        total: total,
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
    media: IMedia;
    id: string;
  }): Promise<IMediaDeleteResponse> {
    if (params && params.id && params.media) {
      try {

        if (params.media.is_deleted) {
          return {
            status: HttpStatus.OK,
            message: '⚠️ Media already deleted',
            errors: null,
          };
        }

        await this.mediaService.removeMediaById(params.id);
        return {
          status: HttpStatus.OK,
          message: '✅ Media deleted',
          errors: null,
        };
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
