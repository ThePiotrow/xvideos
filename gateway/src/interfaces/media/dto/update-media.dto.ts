import { ApiProperty } from '@nestjs/swagger';

export class UpdateMediaDto {
  @ApiProperty({ required: false, example: 'test media' })
  name: string;
  @ApiProperty({ required: false, example: 'test media description' })
  description: string;
  @ApiProperty({ required: false, example: +new Date() })
  start_time: number;
  @ApiProperty({ required: false, example: 90000 })
  duration: number;
  @ApiProperty({ required: false, example: true })
  is_solved: boolean;
}
