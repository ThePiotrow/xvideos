export interface IMedia {
  id?: string;
  title: string;
  description: string;
  user_id: string;
  user?: {
    username: string;
    email: string;
    role: string;
    id: string;
  },
  media?: Express.Multer.File;
  thumbnail?: Express.Multer.File;
  urls?: {
    original: string;
    thumbnail?: string;
    hls?: string;
  };
  type?: 'image' | 'video';
  duration?: number;
  created_at?: number;
  updated_at?: number;
  is_deleted?: boolean;
  deleted_at?: number;
}