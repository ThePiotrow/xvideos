import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ConfirmedStrategyService } from './services/confirmed-strategy.service';
import { rolePermissions } from './constants/permissions';
import { IPermissionCheckResponse } from './interfaces/permission-check-response.interface';
import { IUser } from './interfaces/user.interface';

@Controller()
export class PermissionController {
  constructor(private confirmedStrategy: ConfirmedStrategyService) { }

  @MessagePattern('permission_check')
  public permissionCheck(params: {
    user: IUser;
    permission: string;
  }): IPermissionCheckResponse {
    let result: IPermissionCheckResponse;

    if (!params || !params.user || !rolePermissions[params.user.role]) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Permission check failed',
        errors: null,
      };
    } else {
      const allowedPermissions = this.confirmedStrategy.getAllowedPermissions(
        params.user,
        rolePermissions[params.user.role],
      );
      const isAllowed = allowedPermissions.includes(
        params.permission,
      );
      return {
        status: isAllowed ? HttpStatus.OK : HttpStatus.FORBIDDEN,
        message: isAllowed
          ? 'Permission check successful'
          : 'Permission check failed',
        errors: null,
      };
    }
  }
}
