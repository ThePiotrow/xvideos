import { ApiProperty } from '@nestjs/swagger';

export class LiveIdDto {
  @ApiProperty()
  id: string;
}
