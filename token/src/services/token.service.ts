import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { IToken } from '../interfaces/token.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('Token') private readonly tokenModel: Model<IToken>,
  ) { }

  public createToken(userId: string, username: string): Promise<IToken> {
    const token = this.jwtService.sign(
      {
        userId,
        username,
      },
      {
        expiresIn: 30 * 24 * 60 * 60,
      },
    );

    const decoded = this.jwtService.decode(token) as {
      exp: number;
      userId: any;
    };

    return new this.tokenModel({
      user_id: userId,
      username,
      token,
    }).save();
  }

  public deleteTokenForUserId(userId: string): Query<any, any> {
    return this.tokenModel.deleteMany({
      user_id: userId,
    });
  }

  public async decodeToken(token: string) {
    if (!token) {
      return null;
    }

    token = token.replace("Bearer ", "");

    let res: IToken = null;

    const tokenModel = await this.tokenModel.aggregate([
      {
        $match: {
          token: token,
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        }
      },
      {
        $unwind: '$user'
      },
      {
        $addFields: {
          "user.id": { $toString: "$user._id" }
        }
      },
      {
        $project: {
          _id: 0,
          token: 1,
          user: {
            id: 1,
            username: 1,
            email: 1,
            role: 1,
          }
        }
      }
    ]).exec();

    if (tokenModel && tokenModel.length > 0)
      res = tokenModel[0];


    if (!res) return null;

    try {
      const tokenData = this.jwtService.verify(res.token) as {
        exp: number;
        username: string;
        userId: any;
      };

      if (tokenData.exp * 1000 < Date.now()) {
        await this.tokenModel.deleteMany({
          token: token,
        });
        return null;
      }

      console.log({
        userId: tokenData.userId,
        remainingTime: tokenData.exp * 1000 - Date.now(),
      })

      return {
        user: res.user,
        remainingTime: tokenData.exp * 1000 - Date.now(),
      };
    } catch (e) {
      return null;
    }
  }
}