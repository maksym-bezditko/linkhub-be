import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AtJwtGuard extends AuthGuard('jwt-at') {
  getRequest(context: ExecutionContext) {
    const graphqlCtx = GqlExecutionContext.create(context).getContext().req;

    const restCtx = context.switchToHttp().getRequest();

    return graphqlCtx || restCtx;
  }
}
