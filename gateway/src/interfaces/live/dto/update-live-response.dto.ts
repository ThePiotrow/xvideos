import { ApiProperty } from '@nestjs/swagger';
import { ILive } from '../live.interface';

export class UpdateLiveResponseDto {
  @ApiProperty({ example: 'live_update_by_id_success' })
  message: string;
  @ApiProperty({
    example: {
      live: {
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
    },
    nullable: true,
  })
  data: {
    live: ILive;
  };
  @ApiProperty({ example: null, nullable: true })
  errors: { [key: string]: any };
}
