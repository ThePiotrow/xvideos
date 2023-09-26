export interface ITokenDataResponse {
  status: number;
  message: string;
  data: {
    user: {
      username: string;
      email: string;
      role: string;
      id: string;
    } | null;
  }
}