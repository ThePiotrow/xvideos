import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IMedia } from '../interfaces/media.interface';
import { IMediaUpdateParams } from '../interfaces/media-update-params.interface';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel('Media') private readonly mediaModel: Model<IMedia>,
  ) { }

  public async getMediasByUserId(userId: string): Promise<IMedia[]> {
    return this.mediaModel.find({ user_id: userId }).exec();
  }

  public async createMedia(mediaBody: IMedia): Promise<IMedia> {
    const mediaModel = new this.mediaModel(mediaBody);
    return await mediaModel.save();
  }

  public async findMediaById(id: string) {
    return await this.mediaModel.findById(id);
  }

  public async removeMediaById(id: string) {
    return await this.mediaModel.findOneAndDelete({ _id: id });
  }

  public async updateMediaById(
    id: string,
    params: IMediaUpdateParams,
  ): Promise<IMedia> {
    return await this.mediaModel.findOneAndUpdate({ id }, params, {
      new: true,
    });
  }
}
