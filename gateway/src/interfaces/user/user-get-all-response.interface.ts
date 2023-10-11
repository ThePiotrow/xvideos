import { IUser } from './user.interface';

export interface IUserGetAllResponse {
  status: number;
  message: string;
  users: IUser[] | null;
  total?: number;
}