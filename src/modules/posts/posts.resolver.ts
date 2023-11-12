import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { CreatePostInput } from '../../graphql/inputs/create-post.input';
import { UpdatePostInput } from '../../graphql/inputs/update-post.input';
import { UseGuards } from '@nestjs/common';
import { AtJwtGuard } from '../auth/guards/jwt-at.guard';
import { UserIdFromJwt } from 'src/decorators/user-id-from-jwt.decorator';
import { PostResponse } from 'src/graphql/responses/post.response';

@Resolver(() => PostResponse)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AtJwtGuard)
  @Mutation(() => PostResponse)
  createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @UserIdFromJwt() userId: string,
  ) {
    return this.postsService.createPost(userId, createPostInput);
  }

  @Mutation(() => PostResponse)
  deletePost(@Args('id') postId: string) {
    return this.postsService.deletePost(postId);
  }

  @Mutation(() => PostResponse)
  updatePost(@Args('updatePostInput') updatePostInput: UpdatePostInput) {
    return this.postsService.updatePost(updatePostInput);
  }
}
