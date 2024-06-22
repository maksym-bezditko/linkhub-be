import {
  Args,
  Resolver,
  Query,
  Context,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AtJwtGuard } from './guards/jwt-at.guard';
import { RtJwtGuard } from './guards/jwt-rt.guard';
import { AuthService } from './auth.service';
import {
  CreateUserInput,
  SearchUsersInput,
  UpdateUserInput,
} from 'src/graphql/inputs';
import { UserIdFromJwt } from 'src/decorators/user-id-from-jwt.decorator';
import {
  TokensResponse,
  CommonResponse,
  UserResponse,
  UserIdResponse,
  ExistsResponse,
  PostResponse,
} from 'src/graphql/responses';
import { PostsService } from '../posts/posts.service';
import { ImagesService } from '../files/images.service';

@Resolver(() => UserResponse)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly postsService: PostsService,
    private readonly imagesService: ImagesService,
  ) {}

  @Mutation(() => TokensResponse)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<TokensResponse> {
    return this.authService.createUser(createUserInput);
  }

  @Query(() => TokensResponse)
  async loginWithEmail(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<TokensResponse> {
    return this.authService.loginWithEmail(email, password);
  }

  @UseGuards(AtJwtGuard)
  @Mutation(() => CommonResponse)
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @UserIdFromJwt() userId: number,
  ): Promise<CommonResponse> {
    return this.authService.updateUser(userId, updateUserInput);
  }

  @UseGuards(AtJwtGuard)
  @Query(() => UserResponse)
  async getMyProfile(@UserIdFromJwt() userId: number) {
    return this.authService.getUserById(userId);
  }

  @Query(() => ExistsResponse)
  async checkIfUserExistsByEmail(
    @Args('email')
    email: string,
  ): Promise<ExistsResponse> {
    return this.authService.checkForEmailExistence(email);
  }

  @Query(() => ExistsResponse)
  async checkIfUserExistsByNickname(
    @Args('nickname')
    nickname: string,
  ): Promise<ExistsResponse> {
    return this.authService.checkForNicknameExistence(nickname);
  }

  @UseGuards(RtJwtGuard)
  @Query(() => TokensResponse)
  async refreshTokens(@Context() context: any) {
    return this.authService.refreshToken(
      context.req.user.userId,
      context.req.headers.authorization.replace('Bearer ', ''),
    );
  }

  @UseGuards(AtJwtGuard)
  @Mutation(() => UserIdResponse)
  async logout(@UserIdFromJwt() userId: number) {
    return this.authService.logout(userId);
  }

  @UseGuards(AtJwtGuard)
  @Mutation(() => CommonResponse)
  async deleteAccount(@UserIdFromJwt() userId: number) {
    return this.authService.deleteAccount(userId);
  }

  @Query(() => [UserResponse])
  async searchUsers(
    @Args('searchUsersInput') searchUsersInput: SearchUsersInput,
  ) {
    return this.authService.searchUsers(searchUsersInput);
  }

  @ResolveField('posts', () => [PostResponse])
  async posts(@Parent() user: UserResponse) {
    const { id } = user;

    return this.postsService.getUserPosts(id);
  }

  @ResolveField('followers', () => [PostResponse])
  async followers(@Parent() user: UserResponse) {
    const { id } = user;

    return this.authService.getUserFollowers(id);
  }

  @ResolveField('following', () => [PostResponse])
  async following(@Parent() user: UserResponse) {
    const { id } = user;

    return this.authService.getUserFollowings(id);
  }

  @ResolveField('profileImage', () => String, { nullable: true })
  async profileImage(@Parent() user: UserResponse) {
    const { profileImageName } = user;

    if (!profileImageName) {
      return null;
    }

    const { url } = await this.imagesService.getImageUrl(profileImageName);

    return url;
  }
}
