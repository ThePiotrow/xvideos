import { Transport } from '@nestjs/microservices';

export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  constructor() {
    this.envConfig = {};
    this.envConfig.port = process.env.API_GATEWAY_PORT;
    this.envConfig.tokenService = {
      options: {
        port: process.env.TOKEN_SERVICE_PORT,
        host: process.env.TOKEN_SERVICE_HOST,
      },
      transport: Transport.TCP,
    };
    this.envConfig.userService = {
      options: {
        port: process.env.USER_SERVICE_PORT,
        host: process.env.USER_SERVICE_HOST,
      },
      transport: Transport.TCP,
    };
    this.envConfig.mediaService = {
      options: {
        port: process.env.MEDIA_SERVICE_PORT,
        host: process.env.MEDIA_SERVICE_HOST,
      },
      transport: Transport.TCP,
    };
    this.envConfig.liveService = {
      options: {
        port: process.env.LIVE_SERVICE_PORT,
        host: process.env.LIVE_SERVICE_HOST,
      },
      transport: Transport.TCP,
    };
  }

  get(key: string): any {
    return this.envConfig[key];
  }
}
