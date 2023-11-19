import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Me = createParamDecorator(
  (_: never, context: ExecutionContext) =>
    context.switchToHttp().getRequest().me,
);