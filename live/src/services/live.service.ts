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

  public async getLivesByUserId(userId: string): Promise<ILive[]> {
    return this.liveModel.find({ user_id: userId }).exec();
  }

  public async createLive(liveBody: ILive): Promise<ILive> {
    const liveModel = new this.liveModel(liveBody);
    return await liveModel.save();
  }

  public async findLiveById(id: string) {
    return await this.liveModel.findById(id);
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
