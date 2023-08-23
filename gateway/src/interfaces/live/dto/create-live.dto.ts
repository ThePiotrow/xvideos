import { ApiProperty } from '@nestjs/swagger';

export class CreateLiveDto {
  @ApiProperty({ example: 'My live' })
  title: string;
}

