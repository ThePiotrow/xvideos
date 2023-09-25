import { SetMetadata } from '@nestjs/common';

export const Owner = (type: string) =>
  SetMetadata('type', type);
