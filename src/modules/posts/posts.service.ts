import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/database/prisma.service';
import { GraphQLError } from 'graphql';
import { CreatePostInput, UpdatePostInput } from 'src/graphql/inputs';
import { CommonResponse } from 'src/graphql/responses';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async getPostById(postId: number) {
    try {
      const post = await this.prismaService.post.findUnique({
        where: {
          id: postId,
        },
      });

      this.logger.log(`Found post with id: ${postId}`);

      return post;
    } catch (e) {
      this.logger.error('Failed to get post by id: ' + e.message);

      throw new GraphQLError(e.message);
    }
  }

  async getPostImageNameBePostId(postId: number) {
    try {
      const image = await this.prismaService.postImage.findFirst({
        where: {
          postId,
        },
      });

      if (!image) {
        this.logger.log(`Couldn't find an image for post with id: ${postId}`);

        return null;
      }

      this.logger.log(`Found an image for post with id: ${postId}`);

      return image?.name || null;
    } catch (e) {}
  }

  async getAllUserPosts(userId: number) {
    try {
      const posts = await this.prismaService.post.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      this.logger.log(
        `Found ${posts.length} posts for user with id: ${userId}`,
      );

      return posts;
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async getFollowingsPosts(userId: number) {
    try {
      const posts = await this.prismaService.post.findMany({
        where: {
          user: {
            following: {
              some: {
                followingUserId: userId,
              },
            },
          },
        },
      });

      this.logger.log(
        `Found ${posts.length} posts for user with id: ${userId}`,
      );

      return posts;
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async getPostsRecommendations(userId: number) {
    try {
      const myHashtags = await this.prismaService.postsOnHashtags.findMany({
        where: {
          post: {
            userId,
          },
        },
        select: {
          hashtag: {
            select: {
              name: true,
            },
          },
        },
      });

      this.logger.log(
        `Found ${myHashtags.length} hashtags for user with id: ${userId}`,
      );

      const myHashtagNames = myHashtags.map((post) => post.hashtag.name);

      const posts = await this.prismaService.post.findMany({
        where: {
          AND: [
            {
              userId: {
                not: userId,
              },
            },
            {
              postsOnHashtags: {
                some: {
                  hashtag: {
                    name: {
                      in: myHashtagNames,
                    },
                  },
                },
              },
            },
          ],
        },
      });

      this.logger.log(
        `Found ${posts.length} posts for user with id: ${userId}`,
      );

      return posts;
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async createPost(userId: number, createPostInput: CreatePostInput) {
    const { hashtags, caption, location } = createPostInput;

    try {
      const post = await this.prismaService.post.create({
        data: {
          caption,
          location,
          user: {
            connect: {
              id: userId,
            },
          },
          postsOnHashtags: {
            create: hashtags.map((hashtag) => {
              return {
                hashtag: {
                  connectOrCreate: {
                    where: { name: hashtag },
                    create: { name: hashtag },
                  },
                },
              };
            }),
          },
        },
      });

      this.logger.log(`Created post with id: ${post.id}`);

      return post;
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async getUserPosts(userId: number) {
    try {
      const posts = await this.prismaService.post.findMany({
        where: {
          userId,
        },
      });

      this.logger.log(
        `Found ${posts.length} posts for user with id: ${userId}`,
      );

      return posts;
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async deletePost(postId: number, ownerId: number): Promise<CommonResponse> {
    try {
      const post = await this.prismaService.post.delete({
        where: {
          id: postId,
          userId: ownerId,
        },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      this.logger.log(`Deleted post with id: ${postId}`);

      return {
        succeeded: true,
      };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async updatePost(updatePostInput: UpdatePostInput) {
    try {
      const updatedPost = await this.prismaService.post.update({
        where: {
          id: updatePostInput.id,
        },
        data: {
          ...updatePostInput,
        },
      });

      this.logger.log(`Updated post with id: ${updatePostInput.id}`);

      return updatedPost;
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }
}
