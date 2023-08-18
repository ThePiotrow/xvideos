export interface ILiveDeleteResponse {
  status: number;
  message: string;
  errors: { [key: string]: any } | null;
}
