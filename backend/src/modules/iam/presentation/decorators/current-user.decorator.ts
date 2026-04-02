import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  readonly userId: string;
  readonly email: string;
  readonly role: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest<{ user: CurrentUserData }>();
    return request.user;
  },
);
