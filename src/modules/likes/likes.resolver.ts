import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { LikesService } from './likes.service';
import { UseGuards } from '@nestjs/common';
import { UserIdFromJwt } from 'src/decorators/user-id-from-jwt.decorator';
import { LikePostInput, UnlikePostInput } from 'src/graphql/inputs';
import {
  CommonResponse,
  LikeResponse,
  PostResponse,
} from 'src/graphql/responses';
import { AtJwtGuard } from '../auth/guards/jwt-at.guard';
import { PostsService } from '../posts/posts.service';

@Resolver(() => LikeResponse)
export class LikesResolver {
  constructor(
    private readonly likesService: LikesService,
    private readonly postsService: PostsService,
  ) {}

  @UseGuards(AtJwtGuard)
  @Mutation(() => CommonResponse)
  async likePost(
    @UserIdFromJwt() userId: number,
    @Args('likePostInput') likePostInput: LikePostInput,
  ) {
    return this.likesService.likePost(likePostInput, userId);
  }

  @UseGuards(AtJwtGuard)
  @Mutation(() => CommonResponse)
  async unlikePost(
    @UserIdFromJwt() userId: number,
    @Args('unlikePostInput') unlikePostInput: UnlikePostInput,
  ) {
    return this.likesService.unlikePost(unlikePostInput, userId);
  }

  @ResolveField('post', () => PostResponse)
  async post(@Parent() like: LikeResponse) {
    const { postId } = like;

    return this.postsService.getPostById(postId);
  }
}
