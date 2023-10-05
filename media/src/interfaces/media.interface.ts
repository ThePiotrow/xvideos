import { Document } from 'mongoose';

export interface IMedia extends Document {
  title: string;
  description?: string;
  urls: {
    original: string;
    thumbnail?: string;
    hls?: string;
  };
  type: 'image' | 'video';
  duration?: number;
  user_id: string;
  user?: {
    username: string;
    email: string;
    role: string;
    id: string;
  };
  media?: Express.Multer.File;
  thumbnail?: Express.Multer.File;
  created_at?: number;
  updated_at?: number;
  is_deleted?: boolean;
  deleted_at?: number | null;
}
