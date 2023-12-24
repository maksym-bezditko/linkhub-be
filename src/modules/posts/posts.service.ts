import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/database/prisma.service';
import { CreatePostInput } from '../../graphql/inputs/create-post.input';
import { UpdatePostInput } from '../../graphql/inputs/update-post.input';
import { PostWithImagesAndLikesResponse } from 'src/graphql/responses/post-with-images-and-likes.response';
import { GraphQLError } from 'graphql';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { Like, Post, PostImage } from '@prisma/client';
import { PostImageResponse } from 'src/graphql/responses/post-image.response';
import { CUSTOM_PROVIDERS_NAMES } from 'src/models';
import { LikePostInput } from 'src/graphql/inputs/like-post.input';
import { UnlikePostInput } from 'src/graphql/inputs/unlike-post.input';
import { PostOwnerResponse } from 'src/graphql/responses/post-owner.response';
import { CommonResponse } from 'src/graphql/responses/common.response';
import { HashtagResponse } from 'src/graphql/responses/hashtag.response';
import { HashtagsInput } from 'src/graphql/inputs/hashtags.input';

@Injectable()
export class PostsService {
  constructor(
    @Inject(CUSTOM_PROVIDERS_NAMES.S3_CLIENT)
    private readonly s3Client: S3Client,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getFriendsPosts(
    userId: number,
    hashtagInput: HashtagsInput,
  ): Promise<PostWithImagesAndLikesResponse[]> {
    try {
      const posts = await this.prismaService.post.findMany({
        where: {
          AND: [
            {
              user: {
                following: {
                  some: {
                    followingUserId: userId,
                  },
                },
              },
            },
            hashtagInput.tags.length > 0
              ? {
                  postsOnHashtags: {
                    some: {
                      hashtag: {
                        name: {
                          in: hashtagInput.tags,
                        },
                      },
                    },
                  },
                }
              : undefined,
          ],
        },
        select: {
          id: true,
          caption: true,
          location: true,
          postImages: true,
          likes: true,
          userId: false,
          user: {
            select: {
              id: true,
              nickname: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });

      return await Promise.all(posts.map((post) => this.mapPostResponse(post)));
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async getHashtags(): Promise<HashtagResponse[]> {
    try {
      return await this.prismaService.hashtag.findMany();
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async getPostsRecommendations(
    userId: number,
  ): Promise<PostWithImagesAndLikesResponse[]> {
    try {
      const myHashtags = await this.prismaService.post.findMany({
        where: {
          userId,
        },
        select: {
          postsOnHashtags: {
            select: {
              hashtag: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      const posts = await this.prismaService.post.findMany({
        where: {
          AND: [
            {
              postsOnHashtags: {
                some: {
                  hashtag: {
                    name: {
                      in: myHashtags.flatMap((post) =>
                        post.postsOnHashtags.map((h) => h.hashtag.name),
                      ),
                    },
                  },
                },
              },
            },
            {
              userId: {
                not: userId,
              },
            },
          ],
        },
        select: {
          id: true,
          caption: true,
          location: true,
          postImages: true,
          likes: true,
          userId: false,
          user: {
            select: {
              id: true,
              nickname: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });

      return await Promise.all(posts.map((post) => this.mapPostResponse(post)));
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async createPost(
    userId: number,
    { hashtags, ...postData }: CreatePostInput,
  ): Promise<PostWithImagesAndLikesResponse> {
    try {
      const hashtagOperations = hashtags.map((hashtag) => {
        return {
          hashtag: {
            connectOrCreate: {
              where: { name: hashtag },
              create: { name: hashtag },
            },
          },
        };
      });

      const post = await this.prismaService.post.create({
        data: {
          ...postData,
          user: {
            connect: {
              id: userId,
            },
          },
          postsOnHashtags: {
            create: hashtagOperations,
          },
        },
        select: {
          id: true,
          caption: true,
          location: true,
          postImages: true,
          likes: true,
          userId: false,
          user: {
            select: {
              id: true,
              nickname: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });

      return this.mapPostResponse(post);
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async getSignedUrl(name: string) {
    let getCommand: GetObjectCommand;

    try {
      getCommand = new GetObjectCommand({
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: name,
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to create a GET command: ' + e.message,
      );
    }

    let url: string;

    try {
      url = await getSignedUrl(this.s3Client, getCommand, { expiresIn: 3600 });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to get signed URL: ' + e.message,
      );
    }

    return url;
  }

  async mapPostResponse(
    post: Omit<Post, 'userId'> & {
      postImages: PostImage[];
      likes: Like[];
      user: PostOwnerResponse;
    },
  ): Promise<PostWithImagesAndLikesResponse> {
    const postImages = [...post.postImages];

    delete post['postImages'];

    const mappedImages: PostImageResponse[] = await Promise.all(
      postImages.map(async (image) => ({
        id: image.id,
        url: await this.getSignedUrl(image.name),
        createdAt: image.createdAt,
        updatedAt: image.updatedAt,
      })),
    );

    return {
      id: post.id,
      caption: post.caption,
      postImages: mappedImages,
      location: post.location,
      likes: post.likes,
      user: post.user,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  async getUserPosts(
    userId: number,
  ): Promise<PostWithImagesAndLikesResponse[]> {
    const posts = await this.prismaService.post.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        caption: true,
        location: true,
        postImages: true,
        likes: true,
        userId: false,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return await Promise.all(posts.map((post) => this.mapPostResponse(post)));
  }

  async deletePost(postId: number, ownerId: number): Promise<CommonResponse> {
    try {
      const post = await this.prismaService.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (post.userId !== ownerId) {
        throw new UnauthorizedException(
          'You are not authorized to delete this post',
        );
      }

      await this.prismaService.post.delete({
        where: {
          id: postId,
        },
      });

      return {
        succeeded: true,
      };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
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

  async likePost(likePostInput: LikePostInput, ownerId: number) {
    try {
      await this.prismaService.like.create({
        data: {
          postId: likePostInput.postId,
          userId: ownerId,
        },
      });

      return {
        succeeded: true,
      };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async unlikePost(unlikePostInput: UnlikePostInput, ownerId: number) {
    try {
      await this.prismaService.like.deleteMany({
        where: {
          postId: unlikePostInput.postId,
          userId: ownerId,
        },
      });

      return {
        succeeded: true,
      };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }
}
