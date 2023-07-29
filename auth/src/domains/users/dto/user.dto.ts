import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  id: string;
  @ApiProperty({ type: String, example: 'John', description: 'firstName' })
  firstName: string;
  @ApiProperty({ type: String, example: 'Doe', description: 'lastName' })
  lastName: string;
  @ApiProperty({
    type: String,
    example: 'johndoe@example.com',
    description: 'email',
  })
  email: string;
  @ApiProperty({ type: String, example: 'Password#0', description: 'password' })
  password: string;
  @ApiProperty({ type: Boolean, example: false, description: 'isAdmin' })
  isAdmin: boolean;
}