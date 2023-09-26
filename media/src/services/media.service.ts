import { Injectable, StreamableFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IMedia } from '../interfaces/media.interface';
import { IMediaUpdateParams } from '../interfaces/media-update-params.interface';

import * as AWS from 'aws-sdk';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'node:fs';
import * as mongoose from 'mongoose';


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

  async uploadFile(file: Express.Multer.File) {
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

  public async getMediaById({ id, all, isDeleted }: { id: string, all?: boolean, isDeleted?: boolean }): Promise<IMedia> {

    const match = (all ?? false) ?
      {
        _id: new mongoose.Types.ObjectId(id),
      } :
      {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: isDeleted ?? false,
      };

    const result = await this.mediaModel.aggregate([
      {
        $match: match
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $addFields: {
          id: "$_id",
          "user.id": "$user._id"
        }
      },
      {
        $project: {
          _id: 0,
          id: 1,
          title: 1,
          description: 1,
          path: 1,
          thumbnail: 1,
          created_at: 1,
          updated_at: 1,
          isDeleted: 1,
          deletedAt: 1,
          user: {
            username: 1,
            email: 1,
            role: 1,
            id: 1
          }
        }
      }
    ]).exec();

    if (result && result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  }

  public async removeMediaById(id: string) {
    const params = {
      isDeleted: true,
      deletedAt: Date.now()
    };

    await this.mediaModel.findOneAndUpdate({ _id: id }, params);

    return this.getMediaById({ id });
  }

  public async updateMediaById(
    id: string,
    params: IMediaUpdateParams,
  ): Promise<IMedia> {
    await this.mediaModel.findOneAndUpdate({ _id: id }, params);

    return this.getMediaById({ id });
  }

  public async createThumbnail(file: Express.Multer.File): Promise<boolean> {

    const path = file.path;
    const output = `${file.filename.split('.')[0]}.png`;

    return new Promise((resolve, reject) => {
      ffmpeg(path)
        .screenshots({
          timestamps: ['50%'],
          filename: output,
          folder: './uploads/thumbnails',
          size: '320x240',
        })
        .on('end', (
          files: { filename: string; timemarks: string }[],
        ) => {
          console.log('files', files)
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

  public async getAllMedias({ all, isDeleted, limit, offset }: { all?: boolean, isDeleted?: boolean, limit: number, offset: number }) {

    const match = (all ?? false) ?
      {
      } :
      {
        isDeleted: isDeleted ?? false,
      };

    const result = await this.mediaModel.aggregate([
      {
        $match: match
      },
      {
        $addFields: {
          id: "$_id"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $addFields: {
          id: "$_id",
          "user.id": "$user._id"
        }
      },
      {
        $project: {
          id: 1,
          title: 1,
          description: 1,
          path: 1,
          thumbnail: 1,
          created_at: 1,
          updated_at: 1,
          isDeleted: 1,
          deletedAt: 1,
          user: {
            id: 1,
            username: 1,
            email: 1,
            role: 1,
          }
        }
      },
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
    ]).exec();

    if (result && result.length > 0) {
      return result;
    } else {
      return null;
    }
  }

  public async getFile(path: string): Promise<StreamableFile> {
    const stream = fs.createReadStream(path);
    return new StreamableFile(stream);
  }
}
