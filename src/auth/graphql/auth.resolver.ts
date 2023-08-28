import { Args, Resolver, Query, Context } from '@nestjs/graphql';
import { Tokens } from './definitions/response/tokens.response';
import { LoginWithEmailInput } from './definitions/inputs/login-with-email.input';
import { UserIdResponse } from './definitions/response/user-id.response';
import { UseGuards } from '@nestjs/common';
import { AtJwtGuard } from '../guards/jwt-at.guard';
import { RtJwtGuard } from '../guards/jwt-rt.guard';
import { AuthService } from '../auth.service';
import { CreateUserInput } from './definitions/inputs/create-user.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => Tokens)
  register(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<Tokens> {
    return this.authService.createUser(createUserInput);
  }

  @Query(() => Tokens)
  loginWithEmail(
    @Args('loginWithEmailInput') loginWithEmailInput: LoginWithEmailInput,
  ): Promise<Tokens> {
    return this.authService.loginWithEmail(loginWithEmailInput);
  }

  @UseGuards(RtJwtGuard)
  @Query(() => Tokens)
  refreshTokens(@Context() context: any) {
    return this.authService.refreshToken(
      context.req.user.userId,
      context.req.headers.authorization.replace('Bearer ', ''),
    );
  }

  @UseGuards(AtJwtGuard)
  @Query(() => UserIdResponse)
  logout(@Args('userId') userId: string) {
    return this.authService.logout(userId);
  }
}
