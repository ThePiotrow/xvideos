export interface IServiceMediaDeleteResponse {
  status: number;
  message: string;
  errors: { [key: string]: any };
}
