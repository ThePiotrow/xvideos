import { Document } from 'mongoose';

export interface IUser extends Document {
  id?: string;
  username: string;
  email: string;
  password?: string;
  is_confirmed: boolean;
  role: string;
  compareEncryptedPassword: (password: string) => boolean;
  getEncryptedPassword: (password: string) => string;
}