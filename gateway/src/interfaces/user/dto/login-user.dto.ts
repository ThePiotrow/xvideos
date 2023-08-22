import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'username' })
  username: string;
  @ApiProperty({ example: 'test11' })
  password: string;
}
