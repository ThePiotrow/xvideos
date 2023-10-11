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

  async searchUserById({ id, all, is_deleted, media }: { id: string, all?: boolean, is_deleted?: boolean, media?: boolean }): Promise<IUser> {

    const match = (all ?? false) ?
      {
        _id: new mongoose.Types.ObjectId(id),
      } :
      {
        _id: new mongoose.Types.ObjectId(id),
        is_deleted: is_deleted ?? false,
      };

    media = media ?? false;

    let pipeline: any[] = [
      {
        $match: match,
      },
      {
        $addFields: {
          id: "$_id"
        }
      },
      {
        $lookup: {
          from: "lives",
          let: { user_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user_id", "$$user_id"] },
                    { $eq: ["$end_time", null] }
                  ]
                }
              }
            },
            {
              $sort: { start_time: -1 }
            },
            {
              $limit: 1
            }
          ],
          as: "live"
        }
      },
      {
        $unwind: {
          path: "$live",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          "live.id": "$live._id",
          "live.user_id": "$live.user_id",
          "live.title": "$live.title",
          "live.start_time": "$live.start_time",
          "live.end_time": "$live.end_time",
          "live.created_at": "$live.created_at",
          "live.updated_at": "$live.updated_at",
        }
      },
      {
        $project: {
          _id: 0,
          id: 1,
          username: 1,
          email: 1,
          is_confirmed: 1,
          role: 1,
          live: 1
        }
      }

    ];

    const project = media ?
      {
        _id: 0,
        id: 1,
        username: 1,
        email: 1,
        is_confirmed: 1,
        role: 1,
        live: 1,
        media: 1
      } :
      {
        id: 1,
        username: 1,
        email: 1,
        is_confirmed: 1,
        role: 1,
        live: 1
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

  async searchUserAll({ all, limit, offset, is_deleted, media }: { all?: boolean, limit: number; offset: number; is_deleted?: boolean, media?: boolean }): Promise<IUser[]> {

    const match = (all ?? false) ?
      {
      } :
      {
        is_deleted: is_deleted ?? false,
      };

    media = media ?? false;

    let pipeline: any[] = [
      {
        $match: match,
      },
      {
        $addFields: {
          id: "$_id"
        }
      },
      {
        $lookup: {
          from: "lives",
          let: { user_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user_id", "$$user_id"] },
                    { $eq: ["$end_time", null] }
                  ]
                }
              }
            },
            {
              $sort: { start_time: -1 }
            },
            {
              $limit: 1
            }
          ],
          as: "live"
        }
      },
      {
        $unwind: {
          path: "$live",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          "live.id": "$live._id",
          "live.user_id": "$live.user_id",
          "live.title": "$live.title",
          "live.start_time": "$live.start_time",
          "live.end_time": "$live.end_time",
          "live.created_at": "$live.created_at",
          "live.updated_at": "$live.updated_at",
        }
      },
      {
        $project: {
          _id: 0,
          id: 1,
          username: 1,
          email: 1,
          is_confirmed: 1,
          role: 1,
          live: 1
        }
      }

    ];

    const project = media ?
      {
        _id: 0,
        id: 1,
        username: 1,
        email: 1,
        is_confirmed: 1,
        role: 1,
        live: 1,
        media: 1
      } :
      {
        id: 1,
        username: 1,
        email: 1,
        is_confirmed: 1,
        role: 1,
        live: 1
      };

    pipeline.push({
      $project: project
    });

    pipeline.push(
      {
        $skip: Number(offset)
      },
      {
        $limit: Number(limit)
      }
    );

    let result = await this.userModel.aggregate(pipeline).exec();

    if (result && result.length > 0) {
      return result
    } else {
      return null;
    }
  }

  async searchUserByUsername({ username, all, is_deleted, media }: { username: string, all?: boolean, is_deleted?: boolean, media?: boolean }): Promise<IUser> {

    const match = (all ?? false) ?
      {
        username,
      } :
      {
        username,
        is_deleted: is_deleted ?? false,
      };

    media = media ?? false;

    let pipeline: any[] = [
      {
        $match: match,
      },
      {
        $addFields: {
          id: "$_id"
        }
      },
      //add last live with end_time = null
      {
        $lookup: {
          from: "lives",
          let: { user_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user_id", "$$user_id"] },
                    { $eq: ["$end_time", null] }
                  ]
                }
              }
            },
            {
              $sort: { start_time: -1 }
            },
            {
              $limit: 1
            }
          ],
          as: "live"
        }
      },
      {
        $unwind: {
          path: "$live",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          "live.id": "$live._id",
          "live.user_id": "$live.user_id",
          "live.title": "$live.title",
          "live.start_time": "$live.start_time",
          "live.end_time": "$live.end_time",
          "live.created_at": "$live.created_at",
          "live.updated_at": "$live.updated_at",
        }
      }
    ];

    if (media) {
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
          medias: {
            $map: {
              input: "$medias",
              as: "media",
              in: {
                id: "$$media._id",
                title: "$$media.title",
                description: "$$media.description",
                duration: "$$media.duration",
                thumbnail: "$$media.urls.thumbnail",
                type: "$$media.type",
                is_deleted: "$$media.is_deleted",
                deleted_at: "$$media.deleted_at",
                updated_at: "$$media.updated_at",
                created_at: "$$media.created_at"
              }
            }
          }
        }
      });
    }

    const project = media ?
      {
        id: 1,
        username: 1,
        email: 1,
        is_confirmed: 1,
        role: 1,
        live: 1,
        medias: 1
      } :
      {
        id: 1,
        username: 1,
        email: 1,
        is_confirmed: 1,
        role: 1,
        live: 1
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

  public async removeUserById(id: string) {
    const params = {
      is_deleted: true,
      deleted_at: Date.now()
    };

    await this.userModel.findOneAndUpdate({ _id: id }, params);

    return this.searchUserById({ id });
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

  public async count() {
    return await this.userModel.countDocuments({}).exec();
  }
}
