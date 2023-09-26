import { ApiProperty } from '@nestjs/swagger';

export class CreateMediaDto {
  @ApiProperty({ example: 'test media' })
  title: string;
  @ApiProperty({ example: 'test media description' })
  description: string;
}
