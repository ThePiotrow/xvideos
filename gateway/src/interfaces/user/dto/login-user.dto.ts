import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'myusername' })
  username: string;
  @ApiProperty({ example: 'test11' })
  password: string;
}
