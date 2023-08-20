import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PostsService } from '../posts.service';
import { Post } from './definitions/queries/post.definition';
import { CreatePostInput } from './definitions/mutations/create-post.definition';
import { UpdatePostInput } from './definitions/mutations/update-post.definition';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [Post])
  posts() {
    return this.postsService.getAllPosts();
  }

  @Mutation(() => Post)
  createPost(@Args('createPostInput') createPostInput: CreatePostInput) {
    return this.postsService.createPost(createPostInput);
  }

  @Mutation(() => Post)
  deletePost(@Args('id') postId: string) {
    return this.postsService.deletePost(postId);
  }

  @Mutation(() => Post)
  updatePost(@Args('updatePostInput') updatePostInput: UpdatePostInput) {
    return this.postsService.updatePost(updatePostInput);
  }
}
