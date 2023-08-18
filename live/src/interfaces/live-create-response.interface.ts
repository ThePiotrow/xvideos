import { ILive } from './live.interface';

export interface ILiveCreateResponse {
  status: number;
  message: string;
  live: ILive | null;
  errors: { [key: string]: any } | null;
}
