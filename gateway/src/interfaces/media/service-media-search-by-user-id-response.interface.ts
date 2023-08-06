import { IMedia } from './media.interface';

export interface IServiceMediaSearchByUserIdResponse {
  status: number;
  message: string;
  medias: IMedia[];
}
