import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { LiveService } from './services/live.service';
import { ILive } from './interfaces/live.interface';
import { ILiveUpdateParams } from './interfaces/live-update-params.interface';
import { ILiveSearchByUserResponse } from './interfaces/live-search-by-user-response.interface';
import { ILiveDeleteResponse } from './interfaces/live-delete-response.interface';
import { ILiveCreateResponse } from './interfaces/live-create-response.interface';
import { ILiveUpdateByIdResponse } from './interfaces/live-update-by-id-response.interface';

@Controller()
export class LiveController {
  constructor(private readonly liveService: LiveService) { }

  @MessagePattern('live_search_by_user_id')
  public async liveSearchByUserId(
    userId: string,
  ): Promise<ILiveSearchByUserResponse> {
    let result: ILiveSearchByUserResponse;

    if (userId) {
      const lives = await this.liveService.getLivesByUserId(userId);
      return {
        status: HttpStatus.OK,
        message: 'live_search_by_user_id_success',
        lives,
      };
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'live_search_by_user_id_bad_request',
        lives: null,
      };
    }
  }

  @MessagePattern('live_update_by_id')
  public async liveUpdateById(params: {
    live: ILiveUpdateParams;
    id: string;
    userId: string;
  }): Promise<ILiveUpdateByIdResponse> {
    let result: ILiveUpdateByIdResponse;
    if (params.id) {
      try {
        const live = await this.liveService.findLiveById(params.id);
        console.log('live', live)
        if (live) {
          console.log('live.user_id', live.user_id.toString(), 'params.userId', params.userId)
          if (live.user_id.toString() === params.userId.toString()) {
            if (params.live.end_date) {
              //socket io destroy
            }
            const updatedLive = Object.assign(live, params.live);
            await updatedLive.save();
            return {
              status: HttpStatus.OK,
              message: 'live_update_by_id_success',
              live: updatedLive,
              errors: null,
            };
          } else {
            return {
              status: HttpStatus.FORBIDDEN,
              message: 'live_update_by_id_forbidden',
              live: null,
              errors: null,
            };
          }
        } else {
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'live_update_by_id_not_found',
            live: null,
            errors: null,
          };
        }
      } catch (e) {
        return {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'live_update_by_id_precondition_failed',
          live: null,
          errors: e.errors,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'live_update_by_id_bad_request',
        live: null,
        errors: null,
      };
    }
  }

  @MessagePattern('live_create')
  public async liveCreate(liveBody: ILive): Promise<ILiveCreateResponse> {
    let result: ILiveCreateResponse;

    if (liveBody) {
      try {
        liveBody.socket_id = Math.random().toString(36).substring(2);
        liveBody.start_time = +new Date();
        const live = await this.liveService.createLive(liveBody);
        // socket io create
        return {
          status: HttpStatus.CREATED,
          message: 'live_create_success',
          live,
          errors: null,
        };
      } catch (e) {
        return {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'live_create_precondition_failed',
          live: null,
          errors: e.errors,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'live_create_bad_request',
        live: null,
        errors: null,
      };
    }
  }

  @MessagePattern('live_delete_by_id')
  public async liveDeleteForUser(params: {
    userId: string;
    id: string;
  }): Promise<ILiveDeleteResponse> {
    let result: ILiveDeleteResponse;

    if (params && params.userId && params.id) {
      try {
        const live = await this.liveService.findLiveById(params.id);

        if (live) {
          if (live.user_id === params.userId) {
            await this.liveService.removeLiveById(params.id);
            return {
              status: HttpStatus.OK,
              message: 'live_delete_by_id_success',
              errors: null,
            };
          } else {
            return {
              status: HttpStatus.FORBIDDEN,
              message: 'live_delete_by_id_forbidden',
              errors: null,
            };
          }
        } else {
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'live_delete_by_id_not_found',
            errors: null,
          };
        }
      } catch (e) {
        return {
          status: HttpStatus.FORBIDDEN,
          message: 'live_delete_by_id_forbidden',
          errors: null,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'live_delete_by_id_bad_request',
        errors: null,
      };
    }
  }
}
