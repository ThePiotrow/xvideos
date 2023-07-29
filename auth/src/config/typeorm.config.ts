import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../domains/users/users.entity';

const IS_LOCAL: boolean = process.env.STAGE === 'local';

export const TypeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: 'postgres://root:password@localhost:5432/cocktail-manager-db',
  entities: [User],
  synchronize: true,
  // ssl: !IS_LOCAL,
  // extra: IS_LOCAL
  //   ? {}
  //   : {
  //     ssl: {
  //       rejectUnauthorized: false,
  //     },
  //   },
};