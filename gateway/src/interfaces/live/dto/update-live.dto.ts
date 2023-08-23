import { ApiProperty } from '@nestjs/swagger';

export class UpdateLiveDto {
  @ApiProperty({ required: false, example: 'Edited title' })
  title?: string;
  @ApiProperty({ required: false, example: +new Date() })
  end_date?: number;
}
