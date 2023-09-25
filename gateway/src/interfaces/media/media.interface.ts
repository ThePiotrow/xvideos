export interface IMedia {
  title: string;
  description: string;
  user_id: string;
  user?: {
    username: string;
    email: string;
    role: string;
    id: string;
  }
  file: string;
  data: string;
  created_at: number;
}
