export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  constructor() {
    this.envConfig = {
      port: process.env.MEDIA_SERVICE_PORT,
    };
    console.log("Service Media Port:", this.envConfig['port']);
  }

  get(key: string): any {
    return this.envConfig[key];
  }
}
