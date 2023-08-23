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
        path: './uploads/5d987c3bfb881ec86b476bca/5d987c3bfb881ec86b476bcc',
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
