import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ConfigService } from './config/config.service';
import { IUser } from '../interfaces/user.interface';
import { IUserLink } from '../interfaces/user-link.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    @InjectModel('UserLink') private readonly userLinkModel: Model<IUserLink>,
    private readonly configService: ConfigService,
  ) { }

  async searchUser(params: { email: string }): Promise<IUser[]> {
    return this.userModel.find(params).exec();
  }

  async searchUserById(id: string): Promise<IUser> {
    return this.userModel.findById(id).exec();
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


  getConfirmationLink(link: string): string {
    return `${this.configService.get('baseUri')}:${this.configService.get(
      'gatewayPort',
    )}/users/confirm/${link}`;
  }
}
