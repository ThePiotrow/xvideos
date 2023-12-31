import { ApiProperty } from '@nestjs/swagger';

export class UpdateMediaDto {
  @ApiProperty({ required: false, example: 'test media' })
  title?: string;
  @ApiProperty({ required: false, example: 'test media description' })
  description?: string;
  @ApiProperty({ required: false, example: 'test media is deleted' })
  is_deleted?: string;
}
