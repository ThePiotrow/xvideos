import { ApiProperty } from '@nestjs/swagger';

export class MediaIdDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  all?: boolean;
  @ApiProperty()
  isDeleted?: boolean;
  @ApiProperty()
  allUser?: boolean;
  @ApiProperty()
  isConfirmed?: boolean;
}
