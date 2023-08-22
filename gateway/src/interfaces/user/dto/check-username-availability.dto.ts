import { ApiProperty } from '@nestjs/swagger';

export class CheckUsernameAvailabilityDto {
  @ApiProperty({ example: 'username' })
  username: string;
}
