import { IMedia } from './media.interface';

export interface IMediaSearchByIdResponse {
  status: number;
  message: string;
  media: IMedia;
}
