import { ILive } from './live.interface';

export interface ILiveSearchByIdResponse {
  status: number;
  message: string;
  live: ILive;
}
