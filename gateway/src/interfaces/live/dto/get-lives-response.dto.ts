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
          description: 'test live description',
          start_time: +new Date(),
          end_time: +new Date(),
          user_id: '5d987c3bfb881ec86b476bca',
          socket_id: '5d987c3bfb881ec86b476bcb',
          is_finished: false,
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
