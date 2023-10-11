import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IMedia } from '../interfaces/media.interface';
import { IMediaUpdateParams } from '../interfaces/media-update-params.interface';

import * as AWS from 'aws-sdk';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'node:fs';
import * as mongoose from 'mongoose';
import * as path from 'node:path';


@Injectable()
export class MediaService {
  constructor(
    @InjectModel('Media') private readonly mediaModel: Model<IMedia>,
  ) { }

  private config = {
    1080: {
      codec: "avc1.640028",
      resolution: "1920x1080",
      audioBitrate: "112k",
      videoBitrate: "5099k",
      profile: "high",
      level: "4.0",
    },
    720: {
      codec: "avc1.4d401f",
      resolution: "1280x720",
      audioBitrate: "112k",
      videoBitrate: "2462k",
      profile: "high",
      level: "3.1",
    },
    540: {
      codec: "avc1.42c015",
      resolution: "960x540",
      audioBitrate: "112k",
      videoBitrate: "1537k",
      profile: "high",
      level: "3.1",
    },
    360: {
      codec: "avc1.4d401e",
      resolution: "640x360",
      audioBitrate: "112k",
      videoBitrate: "841k",
      profile: "high",
      level: "3.0",
    },
    270: {
      codec: "avc1.42c00d",
      resolution: "480x270",
      audioBitrate: "112k",
      videoBitrate: "639k",
      profile: "baseline",
      level: "3.0",
    },
    180: {
      codec: "avc1.42c00d",
      resolution: "320x180",
      audioBitrate: "112k",
      videoBitrate: "413k",
      profile: "baseline",
      level: "3.0",
    }
  };

  private getFfmpegOptionsByResolution(resolution: number): string[] {
    const config = this.config[resolution];
    if (!config) {
      throw new Error(`No configuration found for resolution: ${resolution}`);
    }

    return [
      `-c:a aac`,
      `-b:a ${config.audioBitrate}`,
      `-c:v libx264`,
      `-b:v ${config.videoBitrate}`,
      `-s ${config.resolution}`,
      `-profile:v ${config.profile}`,
      `-level:v ${config.level}`,
      '-hls_time 10',
      '-hls_list_size 0',
      '-f hls'
    ];
  }

  AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  private s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_ACCESS_SECRET_KEY,
    region: process.env.AWS_S3_REGION,
  });

  private handleS3Error(e: any): void {
    console.error("Failed to upload file to S3:", e.message);
    throw new Error("Failed to upload file to S3");
  }

  public async uploadFile(file: Express.Multer.File) {
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`

    file.originalname = file.originalname
      .replace(/(\.[^\.]+)$/, `-${suffix}$1`)
      .replace(/[^a-zA-Z0-9-.]/g, '-');

    return await this.s3_upload(
      file.buffer,
      file.mimetype,
      file.originalname,
    );
  }

  private async s3_upload(
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
      this.handleS3Error(e);
    }
  }

  public async getMediasByUserId(userId: string): Promise<IMedia[]> {
    return this.mediaModel.find({ user_id: userId }).exec();
  }

  public async createMedia(mediaBody: IMedia): Promise<IMedia> {
    const mediaModel = new this.mediaModel(mediaBody);
    const media = await mediaModel.save();
    const res = await this.getMediaById({ id: media.id });
    return res;
  }

  public async getMediaById({ id, all, is_deleted, allUser, isConfirmed }: { id: string, all?: boolean, is_deleted?: boolean, allUser?: boolean, isConfirmed?: boolean }): Promise<IMedia> {

    const initialMatch = (all ?? false) ?
      {
        _id: new mongoose.Types.ObjectId(id),
      } :
      {
        _id: new mongoose.Types.ObjectId(id),
        is_deleted: is_deleted ?? false,
      };

    const userMatch = (allUser ?? false) ?
      {
      } :
      {
        "user.is_confirmed": isConfirmed ?? true,
      }

    const pipeline = [
      {
        $match: initialMatch,
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
        $match: userMatch, // Ajouter cette étape pour filtrer en fonction de user.is_confirmed
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
          urls: 1,
          duration: 1,
          type: 1,
          created_at: 1,
          updated_at: 1,
          is_deleted: 1,
          deleted_at: 1,
          user: {
            username: 1,
            email: 1,
            role: 1,
            id: 1,
            is_confirmed: 1,
          },
        },
      },
    ];

    const result = await this.mediaModel.aggregate(pipeline).exec();

    if (result && result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  }

  public async removeMediaById(id: string) {
    const params = {
      is_deleted: true,
      deleted_at: Date.now()
    };

    await this.mediaModel.findOneAndUpdate({ _id: id }, params);

    return this.getMediaById({ id });
  }

  public async updateMediaById(
    id: string,
    params: IMediaUpdateParams,
  ): Promise<IMedia> {
    await this.mediaModel.findOneAndUpdate({ _id: id }, params);

    return await this.getMediaById({ id, all: true });
  }

  public async generateThumbnail(file: { name: string; url: string; mimetype: string; duration: number; }): Promise<{ url: string; name: string }> {
    const outputName = `${file.name.split('.')[0]}-thumbnail.jpg`;
    const outputPath = `./uploads/thumbnails/${outputName}`;

    try {
      const seekTime = file.duration * 0.05;

      await new Promise((resolve, reject) => {
        ffmpeg(file.url)
          .seekInput(seekTime)
          .outputOptions('-vframes 1')
          .outputOptions('-vf', 'scale=-1:500')
          .output(outputPath)
          .on('progress', progress => {
            console.log('Processing: ' + progress.percent + '% done');
          })
          .on('end', () => {
            console.log('Screenshots taken');
            resolve(true);
          })
          .on('error', (err) => {
            console.error(err);
            reject(err);
          })
          .run();
      });

      const uploadResult = await this.s3_upload(
        fs.readFileSync(outputPath),
        'image/jpeg',
        outputName
      );

      fs.unlinkSync(outputPath);

      return uploadResult;
    } catch (error) {
      fs.unlinkSync(outputPath);
      throw error;
    }
  }

  private async getMetadata(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(url, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });
  }

  public async generateVideo(
    file: { name: string; url: string; mimetype: string; },
    resolutions: number[]
  ): Promise<{ url: string }> {
    const BASE_URL = "https://xvideos-bucket.s3.eu-west-1.amazonaws.com/";
    const OUTPUT_BASE = "./uploads/videos/";
    let masterPlaylist: string[] = ['#EXTM3U'];

    for (const resolution of resolutions) {
      const outputName = `${file.name.split('.')[0]}-${resolution}`;
      const outputFolder = path.join(OUTPUT_BASE, outputName);
      const playlistFile = `${outputName}.m3u8`;

      if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
      }

      try {
        const ffmpegOptions = this.getFfmpegOptionsByResolution(resolution);
        await new Promise((resolve, reject) => {
          ffmpeg(file.url)
            .size(`?x${resolution}`)
            .outputOptions(ffmpegOptions)
            .on('start', commandLine => {
              console.log('Resolution: ' + resolution)
            })
            .on('progress', progress => {
              console.log('Processing: ' + Math.max(0, Math.round(Number(progress.percent))).toFixed(2) + '%');
            })
            .on('end', resolve)
            .on('error', reject)
            .save(path.join(outputFolder, playlistFile));
        });

        const uploadPromises = [];

        uploadPromises.push(this.s3_upload(fs.readFileSync(path.join(outputFolder, playlistFile)), 'application/x-mpegURL', `${outputName}/${playlistFile}`));

        const segmentFiles = fs.readdirSync(outputFolder).filter(f => f.endsWith('.ts'));
        for (const segmentFile of segmentFiles) {
          uploadPromises.push(this.s3_upload(fs.readFileSync(path.join(outputFolder, segmentFile)), 'video/MP2T', `${outputName}/${segmentFile}`));
        }

        await Promise.all(uploadPromises);

        const metadata = await this.getMetadata(path.join(outputFolder, playlistFile));
        const variantUrl = `${BASE_URL}${outputName}/${playlistFile}`;

        const frameRateValue = metadata.streams[0].r_frame_rate.split('/')[0];

        const bandwidth = parseInt(this.config[resolution].audioBitrate) * 1000 + parseInt(this.config[resolution].videoBitrate) * 1000;
        masterPlaylist.push(`#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=${bandwidth},RESOLUTION=${this.config[resolution].resolution},CODECS="${this.config[resolution].codec}",FRAME-RATE=${frameRateValue},CLOSED-CAPTIONS=NONE`);
        masterPlaylist.push(variantUrl);

      } catch (error) {
        console.error("Error processing resolution:", resolution, "Error:", error);
      } finally {
        if (fs.existsSync(outputFolder)) {
          fs.rmdirSync(outputFolder, { recursive: true });
        }
      }
    }
    const url = `${BASE_URL}${file.name.split('.')[0]}-master.m3u8`;
    await this.s3_upload(Buffer.from(masterPlaylist.join('\n')), 'application/x-mpegURL', `${file.name.split('.')[0]}-master.m3u8`);
    return { url };
  }


  public async getAllMedias({ all, is_deleted, limit, offset, allUser, isConfirmed, userId }: { all?: boolean, is_deleted?: boolean, limit: number, offset: number, allUser?: boolean, isConfirmed?: boolean, userId?: string }) {

    let match: { is_deleted?: boolean, user_id?: mongoose.Types.ObjectId } = (all ?? false) ?
      {
      } :
      {
        is_deleted: is_deleted ?? false,
      };

    console.log("limit : ", limit)
    console.log("offset : ", offset)

    if (userId) {
      match = {
        ...match,
        user_id: new mongoose.Types.ObjectId(userId)
      }
    }

    const userMatch = (allUser ?? false) ?
      {
      } :
      {
        "user.is_confirmed": isConfirmed ?? true,
      }

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
        $match: userMatch,
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
          urls: 1,
          duration: 1,
          type: 1,
          created_at: 1,
          updated_at: 1,
          is_deleted: 1,
          deleted_at: 1,
          user: {
            username: 1,
            email: 1,
            role: 1,
            id: 1,
            is_confirmed: 1,
          }
        }
      },
      {
        $sort: {
          created_at: -1
        }
      },
      {
        $skip: Number(offset)
      },
      {
        $limit: Number(limit)
      }
    ]).exec();

    if (result && result.length > 0) {
      return result;
    } else {
      return null;
    }
  }

  public async count() {
    return await this.mediaModel.countDocuments({}).exec();
  }
}
