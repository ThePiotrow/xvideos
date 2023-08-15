export interface IMediaDeleteResponse {
  status: number;
  message: string;
  errors: { [key: string]: any } | null;
}
