import { ILive } from './live.interface';

export interface ILiveSearchByUserResponse {
  status: number;
  message: string;
  lives: ILive[];
}
