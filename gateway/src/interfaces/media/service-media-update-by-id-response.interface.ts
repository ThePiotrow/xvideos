import { IMedia } from './media.interface';

export interface IServiceMediaUpdateByIdResponse {
  status: number;
  message: string;
  media: IMedia | null;
  errors: { [key: string]: any };
}
