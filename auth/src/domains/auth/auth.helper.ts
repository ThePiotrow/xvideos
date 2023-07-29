import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtObject } from './jwt-object.interface';

// Helper class for authentication
@Injectable()
export class AuthHelper {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  constructor(private readonly jwt: JwtService) { }

  // Generate a JWT token
  public generateToken(user: User): string {
    return this.jwt.sign({ id: user.id, email: user.email });
  }

  // Decode a JWT token
  public decodeToken(token: string): JwtObject {
    return this.jwt.verify(token);
  }

  // Validate a user's password
  public validPwd(user: User, pwd: string): boolean {
    return bcrypt.compareSync(pwd, user.password);
  }

  // Hash a password
  public hashPwd(pwd: string): Promise<string> {
    return bcrypt.hash(pwd, 10);
  }

  private async verifyToken(token: string): Promise<boolean> {
    const verified: JwtObject = this.jwt.verify(token);

    if (!verified) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    const user: User | null = await this.userRepository.findOneBy({
      id: verified.id,
    });

    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }
}
