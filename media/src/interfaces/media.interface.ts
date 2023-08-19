import { Document } from 'mongoose';

export interface IMedia extends Document {
  name: string;
  description: string;
  user_id: string;
  start_time: number;
  duration: number;
  notification_id: number;
  created_at: number;
}
