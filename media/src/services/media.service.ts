import { Injectable, StreamableFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IMedia } from '../interfaces/media.interface';
import { IMediaUpdateParams } from '../interfaces/media-update-params.interface';

import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'node:fs';
import * as AWS from 'aws-sdk';


@Injectable()
export class MediaService {
  constructor(
    @InjectModel('Media') private readonly mediaModel: Model<IMedia>,
  ) { }

  AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  private s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_ACCESS_SECRET_KEY,
    region: process.env.AWS_S3_REGION,
  });

  async uploadFile(file) {
    return await this.s3_upload(
      file.buffer,
      file.mimetype,
      file.originalname,
    );
  }

  async s3_upload(
    buffer: Buffer,
    mimetype: string,
    file_name: string
  ): Promise<{ url: string; name: string }> {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: file_name,
      Body: Buffer.from(buffer),
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: this.s3.config.region,
      },
    };

    try {
      const res = await this.s3.upload(params).promise();

      return {
        url: res.Location,
        name: res.Key,
      };
    } catch (e) {
      console.error("Failed to upload file to S3:", e.message);
    }
  }

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

  public async createThumbnail(path: string, output: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      ffmpeg(path)
        .screenshots({
          timestamps: ['50%'],
          filename: output,
          folder: './thumbnails',
          size: '320x240',
        })
        .on('end', () => {
          console.log('Screenshots taken');
          resolve(true);
        })
        .on('error', (err) => {
          console.error(err);
          reject(false);
        });
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
      // await this.convertFile(path, `${basename}-720.mp4`, '1280x720');
      // await this.convertFile(path, `${basename}-480.mp4`, '854x480');
    } catch (err) {
      console.log('error: ', err);
      return false;
    }

    return true;
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
