import { ApiProperty } from '@nestjs/swagger';
import { ILive } from '../live.interface';

export class GetLivesResponseDto {
  @ApiProperty({ example: 'live_search_success' })
  message: string;
  @ApiProperty({
    example: {
      lives: [
        {
          title: 'test live',
          start_time: +new Date(),
          end_time: +new Date() || null,
          user_id: '5d987c3bfb881ec86b476bca',
          created_at: +new Date(),
          updated_at: +new Date(),
          id: '5d987c3bfb881ec86b476bcc',
        },
      ],
    },
    nullable: true,
  })
  data: {
    lives: ILive[];
  };
  @ApiProperty({ example: 'null' })
  errors: { [key: string]: any };
}
