import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RtJwtGuard extends AuthGuard('jwt-rt') {
  getRequest(context: ExecutionContext) {
    const graphqlCtx = GqlExecutionContext.create(context).getContext();

    const restCtx = context.switchToHttp().getRequest();

    return graphqlCtx || restCtx;
  }
}
