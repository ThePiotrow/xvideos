import { ApiProperty } from '@nestjs/swagger';

export class GetUserByUsernameDto {
  @ApiProperty({ example: 'username' })
  username: string;
}
