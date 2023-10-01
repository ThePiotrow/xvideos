import { ApiProperty } from '@nestjs/swagger';

export class LiveUsernameDto {
  @ApiProperty()
  username: string;
}
