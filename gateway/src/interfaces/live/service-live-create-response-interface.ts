import { ILive } from './live.interface';

export interface IServiceLiveCreateResponse {
  status: number;
  message: string;
  live: ILive | null;
  errors: { [key: string]: any };
}
