import { SetMetadata } from '@nestjs/common';

export const Authorization = () =>
  SetMetadata('secured', true);
