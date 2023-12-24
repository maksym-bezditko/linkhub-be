import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { CreatePostInput } from '../../graphql/inputs/create-post.input';
import { UpdatePostInput } from '../../graphql/inputs/update-post.input';
import { UseGuards } from '@nestjs/common';
import { AtJwtGuard } from '../auth/guards/jwt-at.guard';
import { UserIdFromJwt } from 'src/decorators/user-id-from-jwt.decorator';
import { PostWithImagesAndLikesResponse } from 'src/graphql/responses/post-with-images-and-likes.response';
import { UnlikePostInput } from 'src/graphql/inputs/unlike-post.input';
import { LikePostInput } from 'src/graphql/inputs/like-post.input';
import { CommonResponse } from 'src/graphql/responses/common.response';
import { DeletePostInput } from 'src/graphql/inputs/delete-post-input';
import { HashtagsInput } from 'src/graphql/inputs/hashtags.input';
import { HashtagResponse } from 'src/graphql/responses/hashtag.response';

@Resolver(() => PostWithImagesAndLikesResponse)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AtJwtGuard)
  @Mutation(() => PostWithImagesAndLikesResponse)
  createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @UserIdFromJwt() userId: number,
  ) {
    return this.postsService.createPost(userId, createPostInput);
  }

  @UseGuards(AtJwtGuard)
  @Query(() => [PostWithImagesAndLikesResponse])
  getUserPosts(@UserIdFromJwt() userId: number) {
    return this.postsService.getUserPosts(userId);
  }

  @UseGuards(AtJwtGuard)
  @Query(() => [PostWithImagesAndLikesResponse])
  getFriendsPosts(
    @UserIdFromJwt() userId: number,
    @Args('hashtagsInput') hashtagsInput: HashtagsInput,
  ) {
    return this.postsService.getFriendsPosts(userId, hashtagsInput);
  }

  @Query(() => [HashtagResponse])
  getHashtags() {
    return this.postsService.getHashtags();
  }

  @UseGuards(AtJwtGuard)
  @Query(() => [PostWithImagesAndLikesResponse])
  getPostsRecommendations(@UserIdFromJwt() userId: number) {
    return this.postsService.getPostsRecommendations(userId);
  }

  @UseGuards(AtJwtGuard)
  @Mutation(() => CommonResponse)
  deletePost(
    @UserIdFromJwt() userId: number,
    @Args('deletePostInput') { postId }: DeletePostInput,
  ) {
    return this.postsService.deletePost(postId, userId);
  }

  @Mutation(() => PostWithImagesAndLikesResponse)
  updatePost(@Args('updatePostInput') updatePostInput: UpdatePostInput) {
    return this.postsService.updatePost(updatePostInput);
  }

  @UseGuards(AtJwtGuard)
  @Mutation(() => CommonResponse)
  likePost(
    @UserIdFromJwt() userId: number,
    @Args('likePostInput') likePostInput: LikePostInput,
  ) {
    return this.postsService.likePost(likePostInput, userId);
  }

  @UseGuards(AtJwtGuard)
  @Mutation(() => CommonResponse)
  unlikePost(
    @UserIdFromJwt() userId: number,
    @Args('unlikePostInput') unlikePostInput: UnlikePostInput,
  ) {
    return this.postsService.unlikePost(unlikePostInput, userId);
  }
}
