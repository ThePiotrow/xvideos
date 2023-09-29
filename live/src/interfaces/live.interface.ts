import { Document } from 'mongoose';

export interface ILive extends Document {
  id?: string;
  title: string;
  user_id: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  }
  start_time: number;
  end_time?: number;
  created_at: number;
}
