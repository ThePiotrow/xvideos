import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { Repository } from 'typeorm';
import { AuthHelper } from './auth.helper';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly usersRepository: Repository<User>;

  @Inject(AuthHelper)
  private readonly helper: AuthHelper;

  constructor(private readonly jwt: JwtService) { }


  public async register(body: RegisterDto): Promise<User> {
    const user: User | null = await this.usersRepository.findOneBy({
      email: body.email,
    });

    if (user) throw new RpcException('Email already exists');

    const newUser: User = this.usersRepository.create(body);

    this.usersRepository.insert(newUser);

    return newUser;
  }

  public async login(body: LoginDto): Promise<string> {
    const exists: User | null = await this.usersRepository.findOneBy({
      email: body.email,
    });

    if (!exists) {
      throw new RpcException(
        new NotFoundException(`Could not find user ${body.email}`),
      );
    }

    const isPwdValid = this.helper.validPwd(exists, body.password);

    if (!isPwdValid) {
      throw new RpcException('Invalid password');
    }

    return this.helper.generateToken(exists);
  }

  public async getOneUserByToken(token: string): Promise<User> {
    const { id, email } = this.jwt.decode(token.replace('Bearer ', '')) as {
      id: string;
      email: string;
    };

    const user: User | null = await this.usersRepository.findOneBy({
      id,
      email,
    });

    if (!user) {
      throw new NotFoundException('Could not find user');
    }

    return user;
  }
}
