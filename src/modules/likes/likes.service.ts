import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GraphQLError } from 'graphql';
import { LikePostInput, UnlikePostInput } from 'src/graphql/inputs';

@Injectable()
export class LikesService {
  private readonly logger = new Logger(LikesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async likePost(likePostInput: LikePostInput, ownerId: number) {
    try {
      await this.prismaService.like.create({
        data: {
          postId: likePostInput.postId,
          userId: ownerId,
        },
      });

      this.logger.log(
        `User ${ownerId} liked post with id: ` + likePostInput.postId,
      );

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

      this.logger.log(
        `User ${ownerId} unliked post with id: ` + unlikePostInput.postId,
      );

      return {
        succeeded: true,
      };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async getPostLikes(postId: number) {
    try {
      const likes = await this.prismaService.like.findMany({
        where: {
          postId,
        },
      });

      this.logger.log('Retrieved likes for post with id: ' + postId);

      return likes;
    } catch (e) {
      this.logger.error('Failed to get likes for post: ' + e.message);

      throw new GraphQLError(e.message);
    }
  }
}
