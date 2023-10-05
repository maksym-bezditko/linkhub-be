import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/database/prisma.service';
import { CreatePostInput } from './graphql/definitions/mutations/create-post.definition';
import { UpdatePostInput } from './graphql/definitions/mutations/update-post.definition';

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllPosts() {
    return this.prismaService.post.findMany();
  }

  async createPost(createPostInput: CreatePostInput) {
    return this.prismaService.post.create({
      data: {
        ...createPostInput,
      },
    });
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
