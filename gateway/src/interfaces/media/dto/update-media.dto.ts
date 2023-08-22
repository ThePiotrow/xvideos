import { ApiProperty } from '@nestjs/swagger';

export class UpdateMediaDto {
  @ApiProperty({ required: false, example: 'test media' })
  name: string;
  @ApiProperty({ required: false, example: 'test media description' })
  description: string;
}
