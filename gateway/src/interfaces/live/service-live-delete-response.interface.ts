export interface IServiceLiveDeleteResponse {
  status: number;
  message: string;
  errors: { [key: string]: any };
}
