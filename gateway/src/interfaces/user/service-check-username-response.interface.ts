import { IUser } from './user.interface';

export interface IServiceUsernameUserCheckAvailabilityDtoResponse {
  status: number;
  message: string;
  available: boolean | null;
  errors: { [key: string]: any };
}
