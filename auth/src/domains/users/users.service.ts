import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { AuthHelper } from '../auth/auth.helper';
import { ChangePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './users.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @Inject(AuthHelper)
  private readonly helper: AuthHelper;

  constructor(@Inject(REQUEST) private readonly request: Request) { }

  public async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find();

    if (!users) {
      throw new RpcException('No users found');
    }

    return users;
  }

  public async getOneUser(id: string): Promise<User> {
    if (!id) {
      throw new RpcException('You must provide an id');
    }

    const user: User | null = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new RpcException('Could not find user');
    }

    return user;
  }

  public async updatePassword(body: ChangePasswordDto): Promise<object> {
    if (!body.oldPwd || !body.newPwd)
      throw new RpcException('You must provide all the informations');

    const reqUser: UserDto = <UserDto>this.request.user;

    if (!reqUser.id)
      throw new RpcException('You must provide all the informations');

    const user: User | null = await this.userRepository.findOneBy({
      id: reqUser.id,
    });

    if (!user || !this.helper.validPwd(user, body.oldPwd)) {
      throw new RpcException('Could not find user');
    }

    user.password = await this.helper.hashPwd(body.newPwd);

    await this.userRepository.save(user);

    return { message: 'User updated succesfully' };
  }

  public async updateProfile(body: UpdateUserDto): Promise<object> {
    if (!body.firstName && !body.lastName)
      throw new RpcException('You must provide all the informations');

    const reqUser: UserDto = <UserDto>this.request.user;

    const user: User | null = await this.userRepository.findOneBy({
      id: reqUser.id,
    });

    if (!user) throw new RpcException('Could not find user');

    if (body.firstName && body.firstName?.length > 0) {
      user.firstName = body.firstName;
    }

    if (body.lastName && body.lastName?.length > 0) {
      user.lastName = body.lastName;
    }

    await this.userRepository.save(user);

    return { message: 'User updated succesfully' };
  }

  public async updateRole(id: string, role: string): Promise<object> {
    const user: User | null = await this.userRepository.findOneBy({ id });

    if (!user) throw new RpcException('Could not find user');

    user.isAdmin = role === 'ADMIN';

    await this.userRepository.save(user);

    return { message: 'User updated succesfully' };
  }

  public async deleteUser(id: string): Promise<object> {
    if (!id) throw new RpcException('You must provide all the informations');

    const user: User | null = await this.userRepository.findOneBy({ id });

    if (!user) throw new RpcException('Could not find user');

    await this.userRepository.remove(user);

    return { message: 'User deleted succesfully' };
  }
}
