import { Document } from 'mongoose';

export interface IMedia extends Document {
  title: string;
  description: string;
  user_id: string;
  path: string;
  thumbnail?: string | null;
  file?: Express.Multer.File;
  data?: string;
  created_at: number;
}
