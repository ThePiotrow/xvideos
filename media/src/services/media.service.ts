import { Injectable, StreamableFile } from '@nestjs/common';
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

  public async createFile(path: string, data: string): Promise<boolean> {

    await new Promise((resolve, reject) => {
      fs.writeFile(path, Buffer.from(data), (err) => {
        if (err) {
          console.log(err);
          reject(false);
        } else {
          console.log("The file has been saved!");
          resolve(true);
        }
      });
    });

    const basename = path.split('.')[0];

    try {
      await this.convertFile(path, `${basename}-720.mp4`, '1280x720');
      await this.convertFile(path, `${basename}-480.mp4`, '854x480');
    } catch (err) {
      console.log('error: ', err);
      return false;
    }

    return true;
  }

  private convertFile(inputPath: string, outputPath: string, size: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .size(size)
        .on('end', async () => {
          console.log('conversion ended');
          await fs.promises.unlink(inputPath);
          resolve();
        })
        .on('error', (err) => {
          console.log('error: ', err);
          reject(err);
        })
        .run();
    });
  }

  public async getAllMedias({ limit, offset }: { limit: number, offset: number }) {
    return this.mediaModel.find()
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  public async getFile(path: string): Promise<StreamableFile> {
    const stream = fs.createReadStream(path);
    return new StreamableFile(stream);
  }
}
