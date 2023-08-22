import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '../user.interface';

export class CheckUsernameAvailabilityResponseDto {
  @ApiProperty({ example: 'user_username_check_availabilityOrEmail' })
  message: string;
  @ApiProperty({
    example: {
      available: true,
    },
    nullable: true,
  })
  data: {
    available: boolean;
  };
  @ApiProperty({ example: null, nullable: true })
  errors: { [key: string]: any };
}
