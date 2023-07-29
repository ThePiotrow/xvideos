import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsEmail, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsAlpha()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsAlpha()
  lastName: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password' })
  @Length(8, 64)
  password: string;
}