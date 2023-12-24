import { Injectable } from '@nestjs/common';
import { FollowsByAgeStatsResponse } from 'src/graphql/responses/follows-by-age-stats.response';
import { PrismaService } from '../database/prisma.service';
import { Sex } from '@prisma/client';
import { sub } from 'date-fns';
import { UserStats } from 'src/graphql/responses/user-stats.response';

@Injectable()
export class StatsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getFollowsByAgeStats(): Promise<FollowsByAgeStatsResponse> {
    return {
      male: {
        to10: await this.getStatsByAgeAndSex(Sex.MALE, 10),
        to20: await this.getStatsByAgeAndSex(Sex.MALE, 20),
        to30: await this.getStatsByAgeAndSex(Sex.MALE, 30),
        to40: await this.getStatsByAgeAndSex(Sex.MALE, 40),
        to50: await this.getStatsByAgeAndSex(Sex.MALE, 50),
        to60: await this.getStatsByAgeAndSex(Sex.MALE, 60),
        to70: await this.getStatsByAgeAndSex(Sex.MALE, 70),
        to80: await this.getStatsByAgeAndSex(Sex.MALE, 80),
      },
      female: {
        to10: await this.getStatsByAgeAndSex(Sex.FEMALE, 10),
        to20: await this.getStatsByAgeAndSex(Sex.FEMALE, 20),
        to30: await this.getStatsByAgeAndSex(Sex.FEMALE, 30),
        to40: await this.getStatsByAgeAndSex(Sex.FEMALE, 40),
        to50: await this.getStatsByAgeAndSex(Sex.FEMALE, 50),
        to60: await this.getStatsByAgeAndSex(Sex.FEMALE, 60),
        to70: await this.getStatsByAgeAndSex(Sex.FEMALE, 70),
        to80: await this.getStatsByAgeAndSex(Sex.FEMALE, 80),
      },
    };
  }

  async getUsersStats(): Promise<UserStats[]> {
    const data = await this.prismaService.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthday: true,
        sex: true,
        followedBy: {
          select: {
            followedUserId: true,
          },
        },
        following: {
          select: {
            followingUserId: true,
          },
        },
      },
    });

    return await this.mapUserStats(data);
  }

  async getUsersWithTopPosts(): Promise<UserStats[]> {
    const data = await this.prismaService.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthday: true,
        sex: true,
        followedBy: {
          select: {
            followedUserId: true,
          },
        },
        following: {
          select: {
            followingUserId: true,
          },
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return await this.mapUserStats(data);
  }

  async getUsersWithTopFollows(): Promise<UserStats[]> {
    const data = await this.prismaService.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthday: true,
        sex: true,
        followedBy: {
          select: {
            followedUserId: true,
          },
        },
        following: {
          select: {
            followingUserId: true,
          },
        },
      },
      orderBy: {
        followedBy: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return await this.mapUserStats(data);
  }

  async mapUserStats(
    users: {
      id: number;
      firstName: string;
      lastName: string;
      sex: Sex;
      birthday: Date;
      followedBy: {
        followedUserId: number;
      }[];
      following: {
        followingUserId: number;
      }[];
    }[],
  ): Promise<UserStats[]> {
    return users.map((user) => {
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        sex: user.sex,
        age: new Date().getFullYear() - new Date(user.birthday).getFullYear(),
        followersNumber: user.followedBy.length,
        followingNumber: user.following.length,
      };
    });
  }

  async getStatsByAgeAndSex(sex: Sex, ageLimit: number): Promise<number> {
    const data = await this.prismaService.follow.groupBy({
      by: ['followedUserId'],
      _count: {
        _all: true,
      },
      where: {
        followedUser: {
          birthday: {
            lt: sub(new Date(), { years: ageLimit - 10 }),
            gte: sub(new Date(), { years: ageLimit }),
          },
          sex,
        },
      },
    });

    const total = data.reduce((sum, item) => sum + item._count._all, 0);

    return data.length === 0 ? 0 : total / data.length;
  }
}
