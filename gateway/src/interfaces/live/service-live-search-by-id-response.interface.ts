import { ILive } from './live.interface';

export interface IServiceLiveSearchByIdResponse {
  status: number;
  message: string;
  errors?: { [key: string]: any };
  live: ILive;
}
