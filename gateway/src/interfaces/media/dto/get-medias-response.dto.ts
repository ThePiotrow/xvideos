import { ApiProperty } from '@nestjs/swagger';
import { IMedia } from '../media.interface';

export class GetMediasResponseDto {
  @ApiProperty({ example: 'media_search_success' })
  message: string;
  @ApiProperty({
    example: {
      medias: [
        {
          title: 'test media',
          description: 'test media description',
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
    medias: IMedia[];
    total?: number;
  };
  @ApiProperty({ example: 'null' })
  errors: { [key: string]: any };
}
