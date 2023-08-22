import { ApiProperty } from '@nestjs/swagger';

export class CreateMediaDto {
  @ApiProperty({ example: 'test media' })
  name: string;
  @ApiProperty({ example: 'test media description' })
  description: string;
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
