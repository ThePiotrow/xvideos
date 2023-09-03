import { SetMetadata } from '@nestjs/common';

export const Admin = () =>
  SetMetadata('admin', true);
