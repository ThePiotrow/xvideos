import { Controller, Inject, UseGuards, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoleAdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/auth.guard';
import { ChangePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';

@ApiTags('Users')
@ApiBearerAuth()
@Controller()
export class UsersController {
  @Inject(UsersService)
  private readonly userService: UsersService;

  @MessagePattern('getAllUsers')
  @UseGuards(JwtAuthGuard, RoleAdminGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @MessagePattern('getOneUser')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public getOneUser(@Payload('id') id: string): Promise<User> {
    return this.userService.getOneUser(id);
  }

  @MessagePattern('updatePassword')
  @UseGuards(JwtAuthGuard)
  public updatePassword(@Payload() body: ChangePasswordDto): Promise<object> {
    return this.userService.updatePassword(body);
  }

  @MessagePattern('updateRole')
  @UseGuards(JwtAuthGuard, RoleAdminGuard)
  public updateRole(
    @Payload('id') id: string,
    @Payload('role') role: string,
  ): Promise<object> {
    return this.userService.updateRole(id, role);
  }

  @MessagePattern('updateProfile')
  @UseGuards(JwtAuthGuard)
  public updateProfile(@Payload() body: UpdateUserDto): Promise<object> {
    return this.userService.updateProfile(body);
  }

  @MessagePattern('deleteUser')
  @UseGuards(JwtAuthGuard, RoleAdminGuard)
  public deleteUser(@Payload('id') id: string): Promise<object> {
    return this.userService.deleteUser(id);
  }
}