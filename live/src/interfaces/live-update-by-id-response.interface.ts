import { ILive } from './live.interface';

export interface ILiveUpdateByIdResponse {
  status: number;
  message: string;
  live?: ILive | null;
  url?: string | null;
  errors: { [key: string]: any } | null;
}
