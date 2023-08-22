import { ApiProperty } from '@nestjs/swagger';

export class GetUserByEmailDto {
  @ApiProperty({ example: 'email' })
  email: string;
}
