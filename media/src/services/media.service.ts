import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IMedia } from '../interfaces/media.interface';
import { IMediaUpdateParams } from '../interfaces/media-update-params.interface';

import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'node:fs';


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

  public async createFile(path: string, data: string) {

    let valid = true;

    fs.writeFile(path, Buffer.from(data), async (err) => {
      if (err) {
        valid = false;
        console.log(err);
      }

      console.log("The file has been saved!");
    })

    const basename = path.split('.')[0];

    ffmpeg(path)
      .output(`${basename}-720.mp4`)
      .size('1280x720')
      .on('end', async () => {
        console.log('conversion ended');
        fs.unlinkSync(path);
      })
      .on('error', (err) => {
        console.log('error: ', err);
        valid = false;
      })
      .run();

    ffmpeg(path)
      .output(`${basename}-480.mp4`)
      .size('854x480')
      .on('end', async () => {
        console.log('conversion ended');
        fs.unlinkSync(path);
      })
      .on('error', (err) => {
        console.log('error: ', err);
        valid = false;
      })
      .run();

    return valid;
  }

  public async getAllMedias({ limit, offset }: { limit: number, offset: number }) {
    return this.mediaModel.find()
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }
}
