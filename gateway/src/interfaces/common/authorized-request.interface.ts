import { ILive } from '../live/live.interface';
import { IMedia } from '../media/media.interface';
import { IUser } from '../user/user.interface';

export interface IAuthorizedRequest extends Request {
  user?: IUser;
  resource?: IMedia | ILive;
}
