import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { JwtObject } from './jwt-object.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  @InjectRepository(User)
  private readonly usersRepository: Repository<User>;

  constructor(@Inject(ConfigService) config: ConfigService) {
    super({
      jwtFromRequest: (req) => {
        return req.token;
      },
      secretOrKey: config.get('JWT_KEY'),
      ignoreExpiration: true,
    });
  }

  private validate(payload: JwtObject): Promise<User | null> {
    return this.usersRepository.findOneBy({ id: payload.id });
  }
}