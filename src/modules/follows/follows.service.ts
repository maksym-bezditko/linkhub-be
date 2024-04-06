import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FollowsService {
  private readonly logger = new Logger(FollowsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async followUser(followedUserId: number, followingUserId: number) {
    try {
      if (followedUserId === followingUserId) {
        throw new BadRequestException('You cannot follow yourself');
      }

      await this.prismaService.follow.create({
        data: {
          followingUserId,
          followedUserId: followedUserId,
        },
      });

      this.logger.log(
        `User with id: ${followingUserId} followed user with id: ${followedUserId}`,
      );

      return {
        succeeded: true,
      };
    } catch (e) {
      this.logger.error('Failed to follow user: ' + e.message);

      throw new GraphQLError(e.message);
    }
  }

  async unfollowUser(followedUserId: number, followingUserId: number) {
    try {
      if (followedUserId === followingUserId) {
        throw new Error('You cannot unfollow yourself');
      }

      await this.prismaService.follow.deleteMany({
        where: {
          followingUserId,
          followedUserId,
        },
      });

      this.logger.log(
        `User with id: ${followingUserId} unfollowed user with id: ${followedUserId}`,
      );

      return {
        succeeded: true,
      };
    } catch (e) {
      this.logger.error('Failed to unfollow user: ' + e.message);

      throw new GraphQLError(e.message);
    }
  }
}
