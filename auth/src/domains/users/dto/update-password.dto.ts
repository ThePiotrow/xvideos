import { IsStrongPassword, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ type: String, example: 'password' })
  @Length(8)
  oldPwd: string;

  @ApiProperty({ type: String, example: 'Password#0' })
  @IsStrongPassword()
  @Length(8)
  newPwd: string;
}