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

  public async getAllLives({ limit, offset }: { limit: number, offset: number }) {
    return this.liveModel.find(
      {
        end_time: null
      }
    )
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
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
