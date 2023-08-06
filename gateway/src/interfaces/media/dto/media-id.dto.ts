import { ApiProperty } from '@nestjs/swagger';

export class MediaIdDto {
  @ApiProperty()
  id: string;
}
