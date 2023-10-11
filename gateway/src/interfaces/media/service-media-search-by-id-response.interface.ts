import { IMedia } from './media.interface';

export interface IServiceMediaSearchByIdResponse {
  status: number;
  message: string;
  media: IMedia;
  total?: number;
}
