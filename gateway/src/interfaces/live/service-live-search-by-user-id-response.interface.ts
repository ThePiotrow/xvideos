import { ILive } from './live.interface';

export interface IServiceLiveSearchByUserIdResponse {
  status: number;
  message: string;
  lives: ILive[];
}
