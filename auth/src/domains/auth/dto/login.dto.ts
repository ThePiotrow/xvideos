import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@poke.fr' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password' })
  @IsNotEmpty()
  password: string;
}