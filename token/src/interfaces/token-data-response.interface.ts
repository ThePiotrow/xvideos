export interface ITokenDataResponse {
  status: number;
  message: string;
  data: { userId: string, username: string } | null;
}