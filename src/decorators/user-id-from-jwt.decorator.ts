import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const UserIdFromJwt = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const restRequest = ctx.switchToHttp().getRequest();

    const gqlRequest = GqlExecutionContext.create(ctx).getContext().req;

    const user = restRequest?.user || gqlRequest?.user;

    return user.userId;
  },
);
