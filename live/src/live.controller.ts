import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { LiveService } from './services/live.service';
import { ILive } from './interfaces/live.interface';
import { ILiveUpdateParams } from './interfaces/live-update-params.interface';
import { ILiveSearchByUserResponse } from './interfaces/live-search-by-user-response.interface';
import { ILiveDeleteResponse } from './interfaces/live-delete-response.interface';
import { ILiveCreateResponse } from './interfaces/live-create-response.interface';
import { ILiveUpdateByIdResponse } from './interfaces/live-update-by-id-response.interface';
import { ILiveSearchByIdResponse } from './interfaces/live-search-by-id-response.interface';
import { threadId } from 'worker_threads';

@Controller()
export class LiveController {
  constructor(private readonly liveService: LiveService) { }

  @MessagePattern('get_all_lives')
  public async liveGetAll(
    params: {
      limit: number
      offset: number,
    }
  ): Promise<ILiveSearchByUserResponse> {

    try {
      const lives = await this.liveService.getAllLives({
        limit: params.limit ?? 10,
        offset: params.offset ?? 0,
      })

      return {
        status: HttpStatus.OK,
        message: '✅ Lives found',
        lives
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

  @MessagePattern('live_search_by_user_id')
  public async liveSearchByUserId(
    params: {
      user_id: string,
      on_air?: boolean,
    }
  ): Promise<ILiveSearchByUserResponse> {
    let result: ILiveSearchByUserResponse;

    if (params.user_id) {
      const lives = await this.liveService.getLivesByUserId(params.user_id, params.on_air);
      return {
        status: HttpStatus.OK,
        message: '✅ Lives found',
        lives,
      };
    }
    return {
      status: HttpStatus.BAD_REQUEST,
      message: '⚠️ Lives not found',
      lives: null,
    };
  }

  @MessagePattern('live_search_by_id')
  public async liveSearchById(params: {
    live_id: string,
    on_air?: boolean,
  }
  ): Promise<ILiveSearchByIdResponse> {
    let result: ILiveSearchByIdResponse;

    if (params.live_id) {
      const live = await this.liveService.findLiveById(params.live_id, params.on_air);

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
  public async liveUpdateById(params: {
    live: ILiveUpdateParams;
    id: string;
    user_id: string;
  }): Promise<ILiveUpdateByIdResponse> {
    let result: ILiveUpdateByIdResponse;
    if (params.id) {
      try {
        const live = await this.liveService.findLiveById(params.id);
        if (live) {
          if (live.user_id.toString() === params.user_id.toString()) {
            if (params.live.end_date) {
              //socket io destroy
            }
            const updatedLive = Object.assign(live, params.live);
            await updatedLive.save();
            return {
              status: HttpStatus.OK,
              message: '✅ Live updated',
              live: updatedLive,
              errors: null,
            };
          } else {
            return {
              status: HttpStatus.FORBIDDEN,
              message: '⛔ Forbidden',
              live: null,
              errors: null,
            };
          }
        } else {
          return {
            status: HttpStatus.NOT_FOUND,
            message: '⚠️ Live not found',
            live: null,
            errors: null,
          };
        }
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

  @MessagePattern('live_stop')
  public async liveStop(params: {
    user_id: string;
    id: string;
  }): Promise<ILiveUpdateByIdResponse> {
    let result: ILiveUpdateByIdResponse;
    if (params.id) {
      try {
        const live: ILive = await this.liveService.findLiveById(params.id);
        if (live) {
          if (live.user_id === params.user_id) {
            live.end_time = +new Date();
            await live.save();
            return {
              status: HttpStatus.OK,
              message: '✅ Live stopped',
              live,
              errors: null,
            };
          } else {
            return {
              status: HttpStatus.FORBIDDEN,
              message: '⛔ Forbidden',
              live: null,
              errors: null,
            };
          }
        } else {
          return {
            status: HttpStatus.NOT_FOUND,
            message: '⚠️ Live not found',
            live: null,
            errors: null,
          };
        }
      } catch (e) {
        return {
          status: HttpStatus.PRECONDITION_FAILED,
          message: '⚠️ Live stop failed',
          live: null,
          errors: e.errors,
        };
      }
    }
    return {
      status: HttpStatus.BAD_REQUEST,
      message: '⚠️ Live stop failed',
      live: null,
      errors: null,
    };
  }

  @MessagePattern('live_delete_by_id')
  public async liveDeleteForUser(params: {
    user_id: string;
    id: string;
  }): Promise<ILiveDeleteResponse> {
    let result: ILiveDeleteResponse;

    if (params && params.user_id && params.id) {
      try {
        const live = await this.liveService.findLiveById(params.id);

        if (live) {
          if (live.user_id === params.user_id) {
            await this.liveService.removeLiveById(params.id);
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
