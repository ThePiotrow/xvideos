import { Document } from 'mongoose';

export interface ILive extends Document {
  id?: string;
  title: string;
  user_id: string;
  start_time: number;
  end_time: number;
  created_at: number;
}
