import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ConfigService } from './config/config.service';
import { IUser } from '../interfaces/user.interface';
import { IUserLink } from '../interfaces/user-link.interface';

import * as mongoose from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    @InjectModel('UserLink') private readonly userLinkModel: Model<IUserLink>,
    private readonly configService: ConfigService,
  ) { }

  async searchUser(data: { username?: string, email?: string, is_confirmed?: boolean }): Promise<IUser[] | null> {
    return this.userModel.find(data).exec();
  }
  async searchUserById(data: { id: string, withMedias?: boolean }): Promise<IUser> {

    data.withMedias = data.withMedias ?? false;

    let pipeline: any[] = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(data.id),
        },
      },
      {
        $addFields: {
          id: "$_id"
        }
      }
    ];

    if (data.withMedias) {
      pipeline.push({
        $lookup: {
          from: 'media',
          localField: '_id',
          foreignField: 'user_id',
          as: 'medias',
        }
      });

      pipeline.push({
        $addFields: {
          "medias.id": "$medias._id"
        }
      });
      pipeline.push({
        $project: {
          "medias._id": 0
        }
      });
    }

    const project = data.withMedias ?
      {
        id: 1,
        username: 1,
        email: 1,
        is_confirmed: 1,
        role: 1,
        medias: 1
      } :
      {
        id: 1,
        username: 1,
        email: 1,
        is_confirmed: 1,
        role: 1,
      };

    pipeline.push({
      $project: project
    });

    let result = await this.userModel.aggregate(pipeline).exec();

    if (result && result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  }

  async updateUserById(
    id: string,
    userParams: {
      email?: string;
      password?: string;
      is_confirmed?: boolean;
      role?: string;
    },
  ): Promise<IUser> {
    return this.userModel.findOneAndUpdate({ _id: id }, userParams, { new: true }).exec();
  }

  async createUser(user: IUser): Promise<IUser> {
    const userModel = new this.userModel(user);
    return await userModel.save();
  }

  async createUserLink(id: string): Promise<IUserLink> {
    const userLinkModel = new this.userLinkModel({
      user_id: id,
    });
    return await userLinkModel.save();
  }

  async getUserLink(link: string): Promise<IUserLink[]> {
    return this.userLinkModel.find({ link, is_used: false }).exec();
  }

  async updateUserLinkById(
    id: string,
    linkParams: { is_used: boolean },
  ): Promise<IUserLink> {
    return this.userLinkModel.findOneAndUpdate({ _id: id }, linkParams, { new: true }).exec();
  }

  async getAllUsers(): Promise<IUser[]> {
    return this.userModel.find().exec();
  }

  getConfirmationLink(link: string): string {
    return `${this.configService.get('baseUri')}:${this.configService.get(
      'gatewayPort',
    )}/users/confirm/${link}`;
  }
}
