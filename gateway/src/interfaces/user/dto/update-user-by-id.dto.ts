import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'username' })
  username?: string;
  @ApiProperty({ example: 'password' })
  password?: string;
  @ApiProperty({ example: 'role' })
  role?: string;
  @ApiProperty({ example: 'email' })
  email?: string;
  @ApiProperty({ example: 'is_confirmed' })
  is_confirmed?: boolean;
}
