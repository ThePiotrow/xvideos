import { Document } from 'mongoose';

export interface IUser extends Document {
  id?: string;
  username: string;
  email: string;
  password?: string;
  is_confirmed: boolean;
  role: string;
  created_at: number;
  updated_at: number;
  isDeleted?: boolean;
  deletedAt?: number;
  compareEncryptedPassword: (password: string) => boolean;
  getEncryptedPassword: (password: string) => string;
}