import { ApiProperty } from '@nestjs/swagger';

export class UpdateLiveDto {
  @ApiProperty({ required: false, example: 'Edited title' })
  name: string;
  @ApiProperty({ required: false, example: 'Edited description' })
  description: string;
  @ApiProperty({ required: false, example: false })
  is_finished?: boolean;
}
