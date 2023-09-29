import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { MessagePattern, ClientProxy } from '@nestjs/microservices';

import { UserService } from './services/user.service';
import { IUser } from './interfaces/user.interface';
import { IUserCreateResponse } from './interfaces/user-create-response.interface';
import { IUserSearchResponse } from './interfaces/user-search-response.interface';
import { IUserConfirmResponse } from './interfaces/user-confirm-response.interface';
import { IUserUsernameCheckAvailabilityResponse } from './interfaces/user-username-check-availability-response.interface';
import { firstValueFrom } from 'rxjs';
import { IUserGetAllResponse } from './interfaces/user-get-all-response.interface';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject('MAILER_SERVICE') private readonly mailerServiceClient: ClientProxy,
  ) { }

  @MessagePattern('user_get_all')
  public async getAllUsers(): Promise<IUserGetAllResponse> {
    let users: IUser[] = await this.userService.getAllUsers();


    if (users) {
      users = users.map((user) => {
        delete user.password;
        return user;
      });

      return {
        status: HttpStatus.OK,
        message: '✅ Users found',
        users,
      };
    } else {
      return {
        status: HttpStatus.NOT_FOUND,
        message: '⚠️ Users not found',
        users: null,
      };
    }
  }


  @MessagePattern('user_search_by_credentials')
  public async searchUserByCredentials(params: {
    username: string;
    password: string;
  }): Promise<IUserSearchResponse> {
    let result: IUserSearchResponse;

    if (params.username && params.password) {
      const users: IUser[] = await this.userService.searchUser({ username: params.username });

      const user: IUser = users[0];

      if (user) {

        delete user.password;

        if (await user.compareEncryptedPassword(params.password)) {
          if (!user.is_confirmed) {
            return {
              status: HttpStatus.UNAUTHORIZED,
              message: '⛔ User not confirmed',
              user: null,
            };
          }
          return {
            status: HttpStatus.OK,
            message: '✅ User found',
            user: user,
          }
        } else {
          return {
            status: HttpStatus.NOT_FOUND,
            message: '⚠️ User not found',
            user: null,
          };
        }
      } else {
        return {
          status: HttpStatus.NOT_FOUND,
          message: '⚠️ User not found',
          user: null,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ User not found',
        user: null,
      };
    }
  }

  @MessagePattern('user_get_by_id')
  public async getUserById(params: { id: string, withMedias?: boolean }): Promise<IUserSearchResponse> {

    if (params.id) {
      const user = await this.userService.searchUserById(params);

      if (user) {
        return {
          status: HttpStatus.OK,
          message: '✅ User found',
          user,
        };
      } else {
        return {
          status: HttpStatus.NOT_FOUND,
          message: '⚠️ User not found',
          user: null,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ User not found',
        user: null,
      };
    }
  }

  @MessagePattern('user_username_check_availability')
  public async getUserByUsername(params: { username: string }): Promise<IUserUsernameCheckAvailabilityResponse> {
    let result: IUserUsernameCheckAvailabilityResponse;

    if (params.username) {
      const users = await this.userService.searchUser({ username: params.username });

      return {
        status: HttpStatus.OK,
        message: !(users && users[0]) ?
          '✅ Username available' :
          '⚠️ Username not available',
        available: !(users && users[0]),
      };
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ Username not available',
        available: null,
      };
    }
  }

  @MessagePattern('user_confirm')
  public async confirmUser(confirmParams: {
    link: string;
  }): Promise<IUserConfirmResponse> {
    let result: IUserConfirmResponse;

    if (confirmParams) {
      const userLink = await this.userService.getUserLink(confirmParams.link);

      if (userLink && userLink[0]) {
        const userId = userLink[0].user_id;
        await this.userService.updateUserById(userId, {
          is_confirmed: true,
        });
        await this.userService.updateUserLinkById(userLink[0].id, {
          is_used: true,
        });
        return {
          status: HttpStatus.OK,
          message: '✅ User confirmed',
          errors: null,
        };
      } else {
        return {
          status: HttpStatus.NOT_FOUND,
          message: '⚠️ User not found',
          errors: null,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ User not found',
        errors: null,
      };
    }
  }

  @MessagePattern('user_create')
  public async createUser(params: IUser): Promise<IUserCreateResponse> {
    let result: IUserCreateResponse;
    let errors: Partial<{
      email:
      { message: string, path: string },
      username:
      { message: string, path: string }
    }> = {};

    if (params.username && params.email && params.password && params.role) {
      const users = [
        ...await this.userService.searchUser({ email: params.email }),
        ...await this.userService.searchUser({ username: params.username })
      ];
      const user: IUser | null = users[0];

      if (user) {
        if (user.email === params.email) {

          errors.email = {
            message: '⚠️ Email already exists',
            path: 'email',
          };
        }

        if (user.username === params.username) {
          errors.username = {
            message: '⚠️ Username already exists',
            path: 'username',
          };
        }

        return {
          status: HttpStatus.CONFLICT,
          message: '⚠️ User already exists',
          user: null,
          errors,
        };
      } else {
        try {
          params.is_confirmed = false;

          const createdUser = await this.userService.createUser(params);
          const userLink = await this.userService.createUserLink(
            createdUser.id,
          );

          delete createdUser.password;

          await firstValueFrom(this.mailerServiceClient
            .send('mail_send', {
              to: createdUser.email,
              subject: 'Email confirmation',
              html: `<center>
            <b>Hello, ${createdUser.username}!</b>
            <br>
            Please confirm your email.
            <br>
            Use the following link for this.<br>
            <a href="${this.userService.getConfirmationLink(
                userLink.link,
              )}"><b>Confirm The Email</b></a>
            </center>`,
            })
          );

          return {
            status: HttpStatus.CREATED,
            message: '✅ User created',
            user: createdUser,
            errors: null,
          };
        } catch (e) {
          return {
            status: HttpStatus.PRECONDITION_FAILED,
            message: '⚠️ User not created',
            user: null,
            errors: e.errors,
          };
        }
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ User not created',
        user: null,
        errors: null,
      };
    }
  }


  @MessagePattern('user_update_by_id')
  public async updateUserById(params:
    {
      id: string;
    }
    & Partial<IUser>
  ): Promise<IUserCreateResponse> {
    let result: IUserCreateResponse;

    if (params.id) {
      const user = await this.userService.updateUserById(params.id, params);

      if (user) {
        return {
          status: HttpStatus.OK,
          message: '✅ User updated',
          user,
          errors: null,
        };
      } else {
        return {
          status: HttpStatus.NOT_FOUND,
          message: '⚠️ User not found',
          user: null,
          errors: null,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ User not found',
        user: null,
        errors: null,
      };
    }
  }

  @MessagePattern('admin_create')
  public async createAdmin(params: IUser): Promise<IUserCreateResponse> {
    let errors: Partial<{
      email:
      { message: string, path: string },
      username:
      { message: string, path: string }
    }> = {};

    if (params) {
      const users = [
        ...await this.userService.searchUser({ email: params.email }),
        ...await this.userService.searchUser({ username: params.username })
      ];
      const user: IUser | null = users[0];

      if (user) {
        if (user.email === params.email) {

          errors.email = {
            message: '⚠️ Email already exists',
            path: 'email',
          };
        }

        if (user.username === params.username) {
          errors.username = {
            message: '⚠️ Username already exists',
            path: 'username',
          };
        }

        return {
          status: HttpStatus.CONFLICT,
          message: '⚠️ User already exists',
          user: null,
          errors,
        };
      } else {
        try {
          params.is_confirmed = false;
          params.role = 'ROLE_ADMIN'

          const createdUser = await this.userService.createUser(params);
          const userLink = await this.userService.createUserLink(
            createdUser.id,
          );

          delete createdUser.password;

          await firstValueFrom(this.mailerServiceClient
            .send('mail_send', {
              to: createdUser.email,
              subject: 'Email confirmation',
              html: `<center>
            <b>Hello, ${createdUser.username}!</b>
            <br>
            Please confirm your email.
            <br>
            Use the following link for this.<br>
            <a href="${this.userService.getConfirmationLink(
                userLink.link,
              )}"><b>Confirm The Email</b></a>
            </center>`,
            })
          );

          return {
            status: HttpStatus.CREATED,
            message: '✅ Admin created',
            user: createdUser,
            errors: null,
          };
        } catch (e) {
          return {
            status: HttpStatus.PRECONDITION_FAILED,
            message: '⚠️ Admin not created',
            user: null,
            errors: e.errors,
          };
        }
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ Admin not created',
        user: null,
        errors: null,
      };
    }
  }

  @MessagePattern('user_delete_by_id')
  public async deleteUserById(params: { id: string }): Promise<IUserCreateResponse> {
    let result: IUserCreateResponse;

    if (params.id) {
      const user = await this.userService.removeUserById(params.id);

      if (user) {
        return {
          status: HttpStatus.OK,
          message: '✅ User deleted',
          user,
          errors: null,
        };
      } else {
        return {
          status: HttpStatus.NOT_FOUND,
          message: '⚠️ User not found',
          user: null,
          errors: null,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '⚠️ User not found',
        user: null,
        errors: null,
      };
    }
  }
}
