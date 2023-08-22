import { IUser } from './user.interface';

export interface IUserUsernameCheckAvailabilityResponse {
  status: number;
  message: string;
  available: boolean | null;
}