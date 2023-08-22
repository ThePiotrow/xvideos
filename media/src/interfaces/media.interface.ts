import { Document } from 'mongoose';

export interface IMedia extends Document {
  name: string;
  description: string;
  user_id: string;
  duration: number | null;
  path: string;
  file: Express.Multer.File;
  created_at: number;
}
