import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/database/prisma.service';
import { CreatePostInput } from '../../graphql/inputs/create-post.input';
import { UpdatePostInput } from '../../graphql/inputs/update-post.input';
import { PostResponse } from 'src/graphql/responses/post.response';
import { GraphQLError } from 'graphql';

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPost(
    userId: string,
    createPostInput: CreatePostInput,
  ): Promise<PostResponse> {
    try {
      const post = await this.prismaService.post.create({
        data: {
          ...createPostInput,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });

      return post;
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async deletePost(postId: string) {
    return this.prismaService.post.delete({
      where: {
        id: postId,
      },
    });
  }

  async updatePost(updatePostInput: UpdatePostInput) {
    return this.prismaService.post.update({
      where: {
        id: updatePostInput.id,
      },
      data: {
        ...updatePostInput,
      },
    });
  }
}
