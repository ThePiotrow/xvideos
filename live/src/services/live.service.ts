import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ILive } from '../interfaces/live.interface';
import { ILiveUpdateParams } from '../interfaces/live-update-params.interface';

import * as mongoose from 'mongoose';
import * as fs from 'node:fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'node:path';

@Injectable()
export class LiveService {
  constructor(
    @InjectModel('Live') private readonly liveModel: Model<ILive>,
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

  private async getMetadata(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(url, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });
  }

  private OUTPUT_BASE = "uploads/live/";

  public async uploadFile(file: Express.Multer.File, liveId: string): Promise<{ url: string, name: string }> {
    return new Promise((resolve, reject) => {

      // path: 'uploads/live/{liveId}/{segmentNumber}.webm'

      const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const modifiedName = 'segment' + '.webm'
        .replace(/(\.[^\.]+)$/, `-${suffix}$1`)
        .replace(/[^a-zA-Z0-9-.]/g, '-');

      const outputFolder = path.join(this.OUTPUT_BASE, liveId)

      if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
      }

      const filepath = path.join(this.OUTPUT_BASE, liveId, modifiedName);

      fs.writeFile(filepath, Buffer.from(file.buffer), (err) => {
        if (err) {
          reject(err);
          return;
        }

        const fileUrl = path.join(this.OUTPUT_BASE, liveId, modifiedName);
        resolve({
          url: fileUrl,
          name: modifiedName
        });
      });
    });
  }

  public async generateVideo(
    file: { name: string; url: string; mimetype: string; },
    resolutions: number[],
    liveId: string
  ): Promise<{ url: string }> {
    const masterFile = `${this.OUTPUT_BASE}master.m3u8`;
    let masterPlaylist: string[] = fs.existsSync(masterFile) ? fs.readFileSync(masterFile, 'utf-8').split('\n') : ['#EXTM3U'];

    for (const resolution of resolutions) {
      const outputName = `${resolution}/${file.name.split('.')[0]}`;
      const outputFolder = path.join(this.OUTPUT_BASE, liveId, outputName);
      const playlistFile = `${outputName}.m3u8`;

      if (fs.existsSync(outputFolder)) {
        fs.rmdirSync(outputFolder, { recursive: true });
      }

      try {
        const ffmpegOptions = this.getFfmpegOptionsByResolution(resolution);
        await new Promise((resolve, reject) => {
          ffmpeg(file.url)
            .size(`?x${resolution}`)
            .outputOptions(ffmpegOptions)
            .on('start', commandLine => {
            })
            .on('progress', progress => {
            })
            .on('end', resolve)
            .on('error', reject)
            .save(path.join(outputFolder, playlistFile));
        });

        const metadata = await this.getMetadata(path.join(outputFolder, playlistFile));
        const variantUrl = `${outputFolder}/${playlistFile}`;

        const frameRateValue = metadata.streams[0].r_frame_rate.split('/')[0];
        const bandwidth = parseInt(this.config[resolution].audioBitrate) * 1000 + parseInt(this.config[resolution].videoBitrate) * 1000;

        masterPlaylist.push(`#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=${bandwidth},RESOLUTION=${this.config[resolution].resolution},CODECS="${this.config[resolution].codec}",FRAME-RATE=${frameRateValue},CLOSED-CAPTIONS=NONE`);
        masterPlaylist.push(variantUrl);

        if (!fs.existsSync(masterFile)) {
          fs.writeFileSync(masterFile, masterPlaylist.join('\n'));
        } else {
          const masterPlaylistContent = fs.readFileSync(masterFile, 'utf-8');
          if (!masterPlaylistContent.includes(variantUrl)) {
            fs.appendFileSync(masterFile, '\n' + masterPlaylist.join('\n'));
          }
        }

      } catch (error) {
        console.error("Error processing resolution:", resolution, "Error:", error);
      } finally {
        if (fs.existsSync(outputFolder)) {
          fs.rmdirSync(outputFolder, { recursive: true });
        }
      }
    }

    const url = masterFile;
    return { url };
  }

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

  public async getAllLives({ all, onAir, limit, offset }: { all: boolean; onAir: boolean; limit: number, offset: number }): Promise<ILive[]> {

    const match = (all ?? false) ?
      {
      } :
      {
        end_time: (onAir ?? false) ? null : { $ne: null },
      };

    console.log(match)

    const result = await this.liveModel.aggregate([
      {
        $match: match,
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
          end_time: 1,
          is_ended: 1,
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

    console.log(result)

    return result;
  }

  public async createLive(liveBody: ILive): Promise<ILive> {
    const liveModel = new this.liveModel(liveBody);
    const live = await liveModel.save();
    const res = await this.findLiveById({ id: live.id });
    return res;
  }

  public async findLiveById({ id, onAir }: { id: string, onAir?: boolean }) {
    const match = (onAir ?? true) ?
      {
        _id: new mongoose.Types.ObjectId(id),
        end_time: { $eq: null, },
      } :
      {
        _id: new mongoose.Types.ObjectId(id),
        end_time: { $ne: null },
      };

    const result = await this.liveModel.aggregate([
      {
        $match: match,
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
          end_time: 1,
          created_at: 1,
          is_ended: 1,
          user: {
            id: 1,
            username: 1,
            email: 1,
            role: 1,
          },
        },
      },
    ]).exec();

    if (result && result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  }

  public async removeLiveById(id: string) {
    return await this.liveModel.findOneAndDelete({ _id: id });
  }

  public async updateLiveById(
    id: string,
    params: ILiveUpdateParams,
  ): Promise<ILive> {
    const live = await this.liveModel.findOneAndUpdate(
      { _id: id },
      { $set: params },
      { new: true },
    );


    return await this.findLiveById({ id });
  }
}
