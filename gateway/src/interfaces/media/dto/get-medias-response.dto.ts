import { ApiProperty } from '@nestjs/swagger';
import { IMedia } from '../media.interface';

export class GetMediasResponseDto {
  @ApiProperty({ example: 'media_search_success' })
  message: string;
  @ApiProperty({
    example: {
      medias: [
        {
          notification_id: null,
          name: 'test media',
          description: 'test media description',
          start_time: +new Date(),
          duration: 90000,
          user_id: '5d987c3bfb881ec86b476bca',
          is_solved: false,
          created_at: +new Date(),
          updated_at: +new Date(),
          id: '5d987c3bfb881ec86b476bcc',
        },
      ],
    },
    nullable: true,
  })
  data: {
    medias: IMedia[];
  };
  @ApiProperty({ example: 'null' })
  errors: { [key: string]: any };
}
