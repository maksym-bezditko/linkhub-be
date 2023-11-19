import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/database/prisma.service';
import { FollowUserInput } from 'src/graphql/inputs/follow-user.input';
import { UnfollowUserInput } from 'src/graphql/inputs/unfollow-user.input';
import { GraphQLError } from 'graphql';
import { UserResponse } from 'src/graphql/responses/user.response';
import { SearchUsersInput } from 'src/graphql/inputs/search-user.input';
import { SearchBy, SexFilter, SortBy } from 'src/models';

@Injectable()
export class FriendsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getRecommendations(userId: string): Promise<UserResponse[]> {
    const userFriends = await this.prismaService.user.findMany({
      where: {
        following: {
          some: {
            followingUserId: userId,
          },
        },
      },
      select: {
        followedBy: {
          select: {
            followedUser: {
              include: {
                followedBy: true,
                following: true,
                posts: {
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
                },
              },
            },
            following: true,
          },
        },
      },
    });

    const friendsOfFriends = userFriends.reduce<UserResponse[]>((acc, user) => {
      const friendsOfFriends = user.followedBy.map(
        (follow) => follow.followedUser,
      );

      return acc.concat(friendsOfFriends);
    }, []);

    return friendsOfFriends.filter((friend) => friend.id !== userId);
  }

  async followUser(followUserInput: FollowUserInput, followingUserId: string) {
    try {
      if (followUserInput.userId === followingUserId) {
        throw new Error('You cannot follow yourself');
      }

      await this.prismaService.follow.create({
        data: {
          followingUserId,
          followedUserId: followUserInput.userId,
        },
      });

      return {
        succeeded: true,
      };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async unfollowUser(
    unfollowUserInput: UnfollowUserInput,
    followingUserId: string,
  ) {
    try {
      if (unfollowUserInput.userId === followingUserId) {
        throw new Error('You cannot unfollow yourself');
      }

      await this.prismaService.follow.deleteMany({
        where: {
          followingUserId,
          followedUserId: unfollowUserInput.userId,
        },
      });

      return {
        succeeded: true,
      };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async searchUsers(
    searchUsersInput: SearchUsersInput,
  ): Promise<UserResponse[]> {
    try {
      const users = await this.prismaService.user.findMany({
        where: {
          AND: [
            searchUsersInput.searchBy === SearchBy.FULLNAME
              ? {
                  AND: [
                    {
                      firstName: {
                        contains: searchUsersInput.searchText.split(' ')[0],
                      },
                    },
                    {
                      lastName: {
                        contains: searchUsersInput.searchText.split(' ')[1],
                      },
                    },
                  ],
                }
              : {
                  nickname: {
                    contains: searchUsersInput.searchText,
                  },
                },
            searchUsersInput.withPostsOnly
              ? {
                  NOT: {
                    posts: {
                      none: {},
                    },
                  },
                }
              : undefined,
            searchUsersInput.sex === SexFilter.ALL
              ? undefined
              : {
                  sex:
                    searchUsersInput.sex === SexFilter.MALES
                      ? 'MALE'
                      : 'FEMALE',
                },
          ],
        },
        orderBy:
          searchUsersInput.sortBy === SortBy.FULLNAME
            ? [
                {
                  firstName: 'asc',
                },
                {
                  lastName: 'asc',
                },
              ]
            : [
                {
                  createdAt: 'desc',
                },
              ],
        include: {
          followedBy: true,
          following: true,
          posts: {
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
          },
        },
      });

      return users;
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }
}
