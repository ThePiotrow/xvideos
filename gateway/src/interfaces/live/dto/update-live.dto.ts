import { ApiProperty } from '@nestjs/swagger';

export class UpdateLiveDto {
  @ApiProperty({ required: false, example: 'Edited title' })
  name: string;
  @ApiProperty({ required: false, example: 'Edited description' })
  description: string;
  @ApiProperty({ required: false, example: +new Date() })
  end_date?: number;
}
