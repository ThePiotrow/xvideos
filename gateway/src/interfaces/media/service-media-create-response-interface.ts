import { IMedia } from './media.interface';

export interface IServiceMediaCreateResponse {
  status: number;
  message: string;
  media: IMedia | null;
  errors: { [key: string]: any };
}
