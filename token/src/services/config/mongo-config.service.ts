import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';

export class MongoConfigService implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: "mongodb+srv://me:me@cluster.gx5xogt.mongodb.net/?retryWrites=true&w=majority&authSource=admin",
    };
  }
}