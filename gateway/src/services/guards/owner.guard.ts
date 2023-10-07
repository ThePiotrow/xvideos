import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { IServiceMediaSearchByIdResponse } from 'src/interfaces/media/service-media-search-by-id-response.interface';
import { IServiceLiveSearchByIdResponse } from 'src/interfaces/live/service-live-search-by-id-response.interface';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('MEDIA_SERVICE') private readonly mediaServiceClient: ClientProxy,
    @Inject('LIVE_SERVICE') private readonly liveServiceClient: ClientProxy,
  ) { }

  public async canActivate(context: ExecutionContext): Promise<boolean> {

    try {

      const type = this.reflector.get<string>(
        'type',
        context.getHandler(),
      );

      if (!type) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      let resource = null;
      let resourceResponse: IServiceMediaSearchByIdResponse | IServiceLiveSearchByIdResponse;

      if (!request.params.id) {
        throw new HttpException(
          {
            message: '[OwnerGuard] ⚠️ Missing resource id',
            data: null,
            errors: null,
          },
          HttpStatus.PRECONDITION_FAILED,
        );
      }

      const id = request.params.id;

      switch (type) {
        case 'media':
          const response: IServiceMediaSearchByIdResponse =
            await firstValueFrom(
              this.mediaServiceClient.send('media_search_by_id', { id, all: true }),
            );

          resourceResponse = response;
          resource = resourceResponse.media;
          break;

        case 'live':
          const liveResponse: IServiceLiveSearchByIdResponse =
            await firstValueFrom(
              this.liveServiceClient.send('live_search_by_id', { id, all: true }),
            );

          console.log('liveResponse', liveResponse)
          resourceResponse = liveResponse;
          resource = resourceResponse.live;
          break;

        default:
          throw new HttpException(
            {
              message: '[OwnerGuard] ⚠️ Invalid resource type',
              data: null,
              errors: null,
            },
            HttpStatus.PRECONDITION_FAILED,
          );
      }

      console.log('resourceResponse', resourceResponse);

      if (resourceResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: resourceResponse.message,
            data: null,
          },
          resourceResponse.status,
        );
      }

      if (resource.user.id.toString() !== request.user.id.toString() && request.user.role !== 'ROLE_ADMIN') {
        throw new HttpException(
          {
            message: '[OwnerGuard] ⛔ Forbidden',
            data: null,

            errors: null,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      request.resource = resource;

      return true;
    } catch (e) {
      throw new HttpException(
        {
          message: e.message,
          data: null,
          errors: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}