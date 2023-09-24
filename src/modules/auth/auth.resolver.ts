import { Args, Resolver, Query, Context, Mutation } from '@nestjs/graphql';
import { Tokens } from '../../graphql/responses/tokens.response';
import { LoginWithEmailInput } from '../../graphql/inputs/login-with-email.input';
import { UserIdResponse } from '../../graphql/responses/user-id.response';
import { UseGuards } from '@nestjs/common';
import { AtJwtGuard } from './guards/jwt-at.guard';
import { RtJwtGuard } from './guards/jwt-rt.guard';
import { AuthService } from './auth.service';
import { CreateUserInput } from '../../graphql/inputs/create-user.input';
import { CheckForEmailExistenceInput } from '../../graphql/inputs/check-for-email-existence.input';
import { CommonResponse } from 'src/graphql/responses/common.response';
import { CheckForUsernameExistenceInput } from 'src/graphql/inputs/check-for-username-existence.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Tokens)
  createUser(
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

  @Query(() => CommonResponse)
  checkForEmailExistence(
    @Args('checkForEmailExistenceInput')
    checkForEmailExistenceInput: CheckForEmailExistenceInput,
  ): Promise<CommonResponse> {
    return this.authService.checkForEmailExistence(checkForEmailExistenceInput);
  }

  @Query(() => CommonResponse)
  checkForUsernameExistence(
    @Args('checkForUsernameExistenceInput')
    checkForUsernameExistenceInput: CheckForUsernameExistenceInput,
  ): Promise<CommonResponse> {
    return this.authService.checkForUsernameExistence(
      checkForUsernameExistenceInput,
    );
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
