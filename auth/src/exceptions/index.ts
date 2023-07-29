import { NotFoundException } from '@nestjs/common';

export const NotFoundError = (entity: string, id: string): NotFoundException =>
  new NotFoundException(
    `${entity.toLowerCase()} with identifier (${id}) doesn't exist`,
  );