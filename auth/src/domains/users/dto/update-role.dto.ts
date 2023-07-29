import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ type: String, example: 'BARMAN | ADMIN', description: 'role' })
  @IsIn(['BARMAN', 'ADMIN'])
  role: 'BARMAN' | 'ADMIN';
}