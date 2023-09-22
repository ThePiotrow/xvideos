import { ApiProperty } from '@nestjs/swagger';

export class GetUserByIdDto {
  @ApiProperty({ example: 'id' })
  id: string;
}
