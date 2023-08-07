import { IMedia } from './media.interface';

export interface IMediaUpdateByIdResponse {
  status: number;
  message: string;
  media: IMedia | null;
  errors: { [key: string]: any } | null;
}
