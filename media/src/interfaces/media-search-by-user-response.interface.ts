import { IMedia } from './media.interface';

export interface IMediaSearchByUserResponse {
  status: number;
  message: string;
  medias: IMedia[];
  total?: number;
}
