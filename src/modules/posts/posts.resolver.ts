import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { UseGuards } from '@nestjs/common';
import { AtJwtGuard } from '../auth/guards/jwt-at.guard';
import { UserIdFromJwt } from 'src/decorators/user-id-from-jwt.decorator';
import {
  CreatePostInput,
  DeletePostInput,
  UpdatePostInput,
} from 'src/graphql/inputs';
import {
  CommonResponse,
  HashtagResponse,
  LikeResponse,
  PostResponse,
  UserResponse,
} from 'src/graphql/responses';
import { AuthService } from '../auth/auth.service';
import { HashtagsService } from '../hashtags/hashtags.service';
import { LikesService } from '../likes/likes.service';

@Resolver(() => PostResponse)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly authService: AuthService,
    private readonly hashtagsService: HashtagsService,
    private readonly likesService: LikesService,
  ) {}

  @UseGuards(AtJwtGuard)
  @Mutation(() => PostResponse)
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @UserIdFromJwt() userId: number,
  ) {
    return this.postsService.createPost(userId, createPostInput);
  }

  @UseGuards(AtJwtGuard)
  @Query(() => [PostResponse])
  async getMyPosts(@UserIdFromJwt() userId: number) {
    return this.postsService.getUserPosts(userId);
  }

  @UseGuards(AtJwtGuard)
  @Query(() => [PostResponse])
  async getFollowingsPosts(@UserIdFromJwt() userId: number) {
    return this.postsService.getFollowingsPosts(userId);
  }

  @UseGuards(AtJwtGuard)
  @Query(() => [PostResponse])
  async getPostsRecommendations(@UserIdFromJwt() userId: number) {
    return this.postsService.getPostsRecommendations(userId);
  }

  @UseGuards(AtJwtGuard)
  @Mutation(() => CommonResponse)
  async deletePost(
    @UserIdFromJwt() userId: number,
    @Args('deletePostInput') { postId }: DeletePostInput,
  ) {
    return this.postsService.deletePost(postId, userId);
  }

  @Mutation(() => PostResponse)
  async updatePost(@Args('updatePostInput') updatePostInput: UpdatePostInput) {
    return this.postsService.updatePost(updatePostInput);
  }

  @ResolveField('owner', () => UserResponse)
  async owner(@Parent() post: PostResponse) {
    const { userId } = post;

    return this.authService.getUserById(userId);
  }

  @ResolveField('hashtags', () => [HashtagResponse])
  async hashtags(@Parent() post: PostResponse) {
    const { id } = post;

    return this.hashtagsService.getPostHashtags(id);
  }

  @ResolveField('likes', () => [LikeResponse])
  async likes(@Parent() post: PostResponse) {
    const { id } = post;

    return this.likesService.getPostLikes(id);
  }
}
