import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../../../../users/domain/entities/user.entity';

export const Requester = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
