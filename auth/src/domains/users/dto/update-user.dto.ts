import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ type: String, example: 'John', description: 'firstName' })
  @IsAlpha()
  firstName?: string;
  @ApiProperty({ type: String, example: 'Doe', description: 'lastName' })
  @IsAlpha()
  lastName?: string;
}