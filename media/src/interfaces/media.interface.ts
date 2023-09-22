import { Document, ObjectId } from 'mongoose';

export interface IMedia extends Document {
  title: string;
  description: string;
  user_id?: string;
  user?: {
    username: string;
    email: string;
    role: string;
    id: string;
  }
  path: string;
  thumbnail?: string | null;
  file?: Express.Multer.File;
  data?: string;
  created_at: number;
  updated_at: number;
}
