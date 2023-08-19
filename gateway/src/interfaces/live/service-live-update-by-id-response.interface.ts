import { ILive } from './live.interface';

export interface IServiceLiveUpdateByIdResponse {
  status: number;
  message: string;
  live: ILive | null;
  errors: { [key: string]: any };
}
