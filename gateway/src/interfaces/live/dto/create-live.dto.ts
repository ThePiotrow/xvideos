import { ApiProperty } from '@nestjs/swagger';

export class CreateLiveDto {
  @ApiProperty({ example: 'My live' })
  title: string;
  @ApiProperty({ example: 'My live description' })
  description: string;
}

