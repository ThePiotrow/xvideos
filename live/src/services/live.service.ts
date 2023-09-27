import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ILive } from '../interfaces/live.interface';
import { ILiveUpdateParams } from '../interfaces/live-update-params.interface';

@Injectable()
export class LiveService {
  constructor(
    @InjectModel('Live') private readonly liveModel: Model<ILive>,
  ) { }

  public async getLivesByUserId(userId: string, onAir?: boolean): Promise<ILive[]> {
    const params: { user_id: string, end_time?: null } = {
      user_id: userId,
    }

    if (onAir)
      params.end_time = null;

    return this.liveModel.find(params).sort(
      { start_time: -1 }
    );
  }

  public async getAllLives({ limit, offset }: { limit: number, offset: number }): Promise<ILive[]> {
    const result = this.liveModel.aggregate([
      {
        $match: {
          end_time: null,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $addFields: {
          id: "$_id",
          "user.id": "$user._id",
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          title: 1,
          start_time: 1,
          created_at: 1,
          user: {
            id: 1,
            username: 1,
            email: 1,
            role: 1,
          },
        },
      },
      {
        $sort: { created_at: -1 },
      },
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
    ]).exec();

    return result;
  }

  public async createLive(liveBody: ILive): Promise<ILive> {
    const liveModel = new this.liveModel(liveBody);
    return await liveModel.save();
  }

  public async findLiveById(id: string, onAir?: boolean) {
    const params: { id: string, end_time?: null } = {
      id: id,
    }

    if (onAir)
      params.end_time = null;

    return await this.liveModel.findOne(params).sort(
      { start_time: -1 }
    );
  }

  public async removeLiveById(id: string) {
    return await this.liveModel.findOneAndDelete({ _id: id });
  }

  public async updateLiveById(
    id: string,
    params: ILiveUpdateParams,
  ): Promise<ILive> {
    return await this.liveModel.findOneAndUpdate({ id }, params, {
      new: true,
    });
  }
}
