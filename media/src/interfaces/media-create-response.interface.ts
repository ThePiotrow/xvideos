import { IMedia } from './media.interface';

export interface IMediaCreateResponse {
  status: number;
  message: string;
  media: IMedia | null;
  errors: { [key: string]: any } | null;
}
