import { ApiProperty } from '@nestjs/swagger';

export class CreateMediaDto {
  @ApiProperty({ example: 'test media' })
  name: string;
  @ApiProperty({ example: 'test media description' })
  description: string;
  @ApiProperty({ example: +new Date() })
  start_time: number;
  @ApiProperty({ example: 90000 })
  duration: number;
}
