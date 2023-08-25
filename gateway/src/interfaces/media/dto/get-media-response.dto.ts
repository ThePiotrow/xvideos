import { ApiProperty } from '@nestjs/swagger';
import { IMedia } from '../media.interface';

export class GetMediaResponseDto {
  @ApiProperty({ example: 'media_search_success' })
  message: string;
  @ApiProperty({
    example: {
      media:
      {
        title: 'test media',
        description: 'test media description',
        user_id: '5d987c3bfb881ec86b476bca',
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
  @ApiProperty({ example: 'null' })
  errors: { [key: string]: any };
}
