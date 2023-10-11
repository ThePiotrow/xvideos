import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { LiveService } from './services/live.service';
import { ILive } from './interfaces/live.interface';
import { ILiveSearchByUserResponse } from './interfaces/live-search-by-user-response.interface';
import { ILiveDeleteResponse } from './interfaces/live-delete-response.interface';
import { ILiveCreateResponse } from './interfaces/live-create-response.interface';
import { ILiveUpdateByIdResponse } from './interfaces/live-update-by-id-response.interface';
import { ILiveSearchByIdResponse } from './interfaces/live-search-by-id-response.interface';
import { ILiveUpdateParams } from './interfaces/live-update-params.interface';

@Controller()
export class LiveController {
  constructor(private readonly liveService: LiveService) { }

  @MessagePattern('get_all_lives')
  public async liveGetAll(
    body: {
      all: boolean;
      onAir: boolean;
      limit: number;
      offset: number;
    }
  ): Promise<ILiveSearchByUserResponse> {

    try {
      const lives = await this.liveService.getAllLives({
        all: body.all ?? false,
        onAir: body.onAir ?? true,
        limit: body.limit ?? 10,
        offset: body.offset ?? 0,
      })
      const totalDocuments = await this.liveService.count()

      return {
        status: HttpStatus.OK,
        message: '✅ Lives found',
        lives,
        total: totalDocuments,
      }
    }

    catch (e) {
      return {
        status: HttpStatus.PRECONDITION_FAILED,
        message: '⚠️ Lives not found',
        lives: null,
      };
    }
  }

  @MessagePattern('live_search_by_id')
  public async liveSearchById(body: {
    id: string,
    on_air?: boolean,
    all?: boolean,
  }
  ): Promise<ILiveSearchByIdResponse> {
    let result: ILiveSearchByIdResponse;

    if (body.id) {
      const live = await this.liveService.findLiveById({
        id: body.id,
        onAir: body.on_air,
        all: body.all,
      });

      if (live)
        return {
          status: HttpStatus.OK,
          message: '✅ Live found',
          live,
        };

      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ Live not found',
        live: null,
      };
    }
  }

  @MessagePattern('live_update_by_id')
  public async liveUpdateById(body: {
    live: ILiveUpdateParams;
    id: string;
    all: boolean;
  }): Promise<ILiveUpdateByIdResponse> {
    if (body.id) {

      if (body.live.is_ended)
        body.live.end_time = +new Date();

      try {
        const live = await this.liveService.updateLiveById(
          body.id,
          body.live,
          body.all,
        );
        return {
          status: HttpStatus.OK,
          message: '✅ Live updated',
          live: live,
          errors: null,
        };
      } catch (e) {
        return {
          status: HttpStatus.PRECONDITION_FAILED,
          message: '⚠️ Live update failed',
          live: null,
          errors: e.errors,
        };
      }
    }
    return {
      status: HttpStatus.BAD_REQUEST,
      message: '⚠️ Live update failed',
      live: null,
      errors: null,
    };
  }

  @MessagePattern('live_create')
  public async liveCreate(body: ILive): Promise<ILiveCreateResponse> {
    let result: ILiveCreateResponse;

    if (body) {
      try {
        const existedLives = await this.liveService.getLivesByUserId(
          body.user_id,
          true
        );

        if (existedLives.length > 0) {
          for (let i = 0; i < existedLives.length; i++) {
            existedLives[i].end_time = +new Date();
            await existedLives[i].save();
          }
        }

        body.start_time = +new Date();
        const live = await this.liveService.createLive(body);
        return {
          status: HttpStatus.CREATED,
          message: '✅ Live created',
          live,
          errors: null,
        };
      } catch (e) {
        return {
          status: HttpStatus.PRECONDITION_FAILED,
          message: '⚠️ Live create failed',
          live: null,
          errors: e.errors,
        };
      }
    }
    return {
      status: HttpStatus.BAD_REQUEST,
      message: '⚠️ Live create failed',
      live: null,
      errors: null,
    };
  }

  @MessagePattern('live_delete_by_id')
  public async liveDeleteForUser(body: {
    user_id: string;
    id: string;
  }): Promise<ILiveDeleteResponse> {
    let result: ILiveDeleteResponse;

    if (body && body.user_id && body.id) {
      try {
        const live = await this.liveService.findLiveById({ id: body.id });

        if (live) {
          if (live.user_id === body.user_id) {
            await this.liveService.removeLiveById(body.id);
            return {
              status: HttpStatus.OK,
              message: '✅ Live deleted',
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
            message: '⚠️ Live not found',
            errors: null,
          };
        }
      } catch (e) {
        return {
          status: HttpStatus.PRECONDITION_FAILED,
          message: '⚠️ Live delete failed',
          errors: null,
        };
      }
    }
    return {
      status: HttpStatus.BAD_REQUEST,
      message: '⚠️ Live delete failed',
      errors: null,
    };
  }
}
