export interface ILive {
  id?: string;
  title: string;
  start_time: number;
  end_date: number;
  user_id: string;
  user?: {
    username: string;
    email: string;
    role: string;
    id: string;
  }
}
