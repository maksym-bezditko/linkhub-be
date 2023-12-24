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
import { CheckForNicknameExistenceInput } from 'src/graphql/inputs/check-for-nickname-existence.input';
import { UserIdFromJwt } from 'src/decorators/user-id-from-jwt.decorator';
import { UserResponse } from 'src/graphql/responses/user.response';
import { UpdateUserInput } from 'src/graphql/inputs/update-user.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => TokensResponse)
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<TokensResponse> {
    return this.authService.createUser(createUserInput);
  }

  @UseGuards(AtJwtGuard)
  @Mutation(() => CommonResponse)
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @UserIdFromJwt() userId: number,
  ): Promise<CommonResponse> {
    return this.authService.updateUser(userId, updateUserInput);
  }

  @Query(() => UserResponse)
  @UseGuards(AtJwtGuard)
  getUserById(@UserIdFromJwt() userId: number): Promise<UserResponse> {
    return this.authService.getUserById(userId);
  }

  @Query(() => TokensResponse)
  loginWithEmail(
    @Args('loginWithEmailInput') loginWithEmailInput: LoginWithEmailInput,
  ): Promise<TokensResponse> {
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
  checkForNicknameExistence(
    @Args('checkForNicknameExistenceInput')
    checkForUsernameExistenceInput: CheckForNicknameExistenceInput,
  ): Promise<CommonResponse> {
    return this.authService.checkForNicknameExistence(
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
  logout(@UserIdFromJwt() userId: number) {
    return this.authService.logout(userId);
  }

  @UseGuards(AtJwtGuard)
  @Mutation(() => CommonResponse)
  deleteAccount(@UserIdFromJwt() userId: number) {
    return this.authService.deleteAccount(userId);
  }
}
