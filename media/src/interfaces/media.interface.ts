import { Document } from 'mongoose';

export interface IMedia extends Document {
  title: string;
  description: string;
  user_id: string;
  duration: number | null;
  path: string;
  file?: Express.Multer.File;
  data?: string;
  created_at: number;
}
