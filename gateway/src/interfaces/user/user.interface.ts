import { ILive } from "../live/live.interface";
import { IMedia } from "../media/media.interface";


export interface IUser {
  id: string;
  email: string;
  username: string;
  password: string;
  role: string;
  medias?: IMedia[];
  live?: ILive;
}
