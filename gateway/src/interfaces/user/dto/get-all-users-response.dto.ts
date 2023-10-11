import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '../user.interface';

export class GetAllUsersResponseDto {
  @ApiProperty({ example: 'user_get_all_success' })
  message: string;
  @ApiProperty({
    example: {
      users: [{
        username: 'username',
        email: 'test@example.com',
        is_confirmed: true,
        id: '5d987c3bfb881ec86b476bcc',
      }],
    },
    nullable: true,
  })
  data: {
    users: IUser[];
    total?: number;
  };
  @ApiProperty({ example: null, nullable: true })
  errors: { [key: string]: any };
}
