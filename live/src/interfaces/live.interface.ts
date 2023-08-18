import { Document } from 'mongoose';

export interface ILive extends Document {
  title: string;
  description: string;
  user_id: string;
  start_time: number;
  end_time: number;
  socket_id: string;
  created_at: number;
}
