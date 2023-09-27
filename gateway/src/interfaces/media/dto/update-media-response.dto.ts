import { ApiProperty } from '@nestjs/swagger';
import { IMedia } from '../media.interface';

export class UpdateMediaResponseDto {
  @ApiProperty({ example: 'media_update_by_id_success' })
  message: string;
  @ApiProperty({
    example: {
      media: {
        title: 'test media',
        description: 'test media description',
        user_id: '5d987c3bfb881ec86b476bca',
        user: {
          username: 'test',
          email: 'test@example.com',
          role: 'ROLE_USER',
          id: '5d987c3bfb881ec86b476bca',
        },
        urls: {
          original: 'http://localhost:3000/media/5d987c3bfb881ec86b476bca/5d987c3bfb881ec86b476bcc/original/test-media.jpg',
          thumbnail: 'http://localhost:3000/media/5d987c3bfb881ec86b476bca/5d987c3bfb881ec86b476bcc/thumbnail/test-media.jpg',
          hls: 'http://localhost:3000/media/5d987c3bfb881ec86b476bca/5d987c3bfb881ec86b476bcc/hls/test-media.m3u8',
        },
        created_at: +new Date(),
        updated_at: +new Date(),
        id: '5d987c3bfb881ec86b476bcc',
      },
    },
    nullable: true,
  })
  data: {
    media: IMedia;
  };
  @ApiProperty({ example: null, nullable: true })
  errors: { [key: string]: any };
}
