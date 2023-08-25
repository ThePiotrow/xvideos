import { Document } from 'mongoose';

export interface IToken extends Document {
  user_id: string;
  username: string;
  token: string;
}