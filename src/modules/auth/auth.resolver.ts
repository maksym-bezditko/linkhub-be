import { Args, Resolver, Query, Context, Mutation } from '@nestjs/graphql';
import { TokensResponse } from 'src/graphql/responses/tokens.response';
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
import { UserIdFromJwt } from 'src/decorators/user-id-from-jwt.decorator';
import { UserResponse } from 'src/graphql/responses/user.response';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => TokensResponse)
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<TokensResponse> {
    return this.authService.createUser(createUserInput);
  }

  @Query(() => TokensResponse)
  loginWithEmail(
    @Args('loginWithEmailInput') loginWithEmailInput: LoginWithEmailInput,
  ): Promise<TokensResponse> {
    return this.authService.loginWithEmail(loginWithEmailInput);
  }

  @Query(() => [UserResponse])
  allUsers(): Promise<UserResponse[]> {
    return this.authService.allUsers();
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
  @Query(() => TokensResponse)
  refreshTokens(@Context() context: any) {
    return this.authService.refreshToken(
      context.req.user.userId,
      context.req.headers.authorization.replace('Bearer ', ''),
    );
  }

  @UseGuards(AtJwtGuard)
  @Mutation(() => UserIdResponse)
  logout(@UserIdFromJwt() userId: string) {
    return this.authService.logout(userId);
  }
}
