import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '../user.interface';

export class UpdateUserResponseDto {
  @ApiProperty({ example: 'user_update_success' })
  message: string;
  @ApiProperty({
    example: {
      user: {
        username: 'username',
        email: 'test@example.com',
        role: 'ROLE_USER',
        is_confirmed: true,
        id: '5d987c3bfb881ec86b476bcc',
      },
    },
    nullable: true,
  })
  data: {
    user: IUser;
  };
  @ApiProperty({ example: null, nullable: true })
  errors: { [key: string]: any };
}
