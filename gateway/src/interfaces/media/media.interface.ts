export interface IMedia {
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
    '1080'?: {
      url: string;
      mimetype: string;
      available: boolean;
    }
    '720'?: {
      url: string;
      mimetype: string;
      available: boolean;
    }
    '480'?: {
      url: string;
      mimetype: string;
      available: boolean;
    }
    '360'?: {
      url: string;
      mimetype: string;
      available: boolean;
    }
    '240'?: {
      url: string;
      mimetype: string;
      available: boolean;
    }
    '144'?: {
      url: string;
      mimetype: string;
      available: boolean;
    }
  };
  type?: 'image' | 'video';
  duration?: number;
  created_at?: number;
  updated_at?: number;
  isDeleted?: boolean;
  deletedAt?: number;
}