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
  async searchUserById(data: { id: string, withMedias: boolean }): Promise<IUser> {

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
      },
      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          is_confirmed: 1,
          role: 1,
        }
      }
    ];

    if (data.withMedias) {
      const lookupStage = {
        $lookup: {
          from: 'media',
          localField: '_id',
          foreignField: 'user_id',
          as: 'medias',
        }
      };

      pipeline.splice(2, 0, lookupStage); // Insert lookup before $project

      pipeline[3].$project.medias = {
        _id: 1,
        title: 1,
        description: 1,
        path: 1,
        thumbnail: 1,
        created_at: 1
      };
    }

    let result = await this.userModel.aggregate(pipeline).exec();

    console.log(result[0])

    if (result && result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  }



  async updateUserById(
    id: string,
    userParams: { is_confirmed: boolean },
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
