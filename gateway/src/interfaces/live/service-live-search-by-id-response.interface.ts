import { ILive } from './live.interface';

export interface IServiceLiveSearchByIdResponse {
  status: number;
  message: string;
  live: ILive;
}
