import { Document } from 'mongoose';

export interface IToken extends Document {
  user_id: string;
  user: {
    username: string;
    email: string;
    role: string;
    id: string;
  }
  token: string;
}