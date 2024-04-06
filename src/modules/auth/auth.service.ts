import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { PrismaService } from 'src/modules/database/prisma.service';
import { GraphQLError } from 'graphql';
import {
  UpdateUserInput,
  LoginWithEmailInput,
  CreateUserInput,
  SearchUsersInput,
  CheckIfUserExistsByEmailInput,
  CheckIfUserExistsByNicknameInput,
} from 'src/graphql/inputs';
import {
  CommonResponse,
  TokensResponse,
  UserIdResponse,
  ExistsResponse,
} from 'src/graphql/responses';
import { SearchBy, SexFilter, SortBy } from 'src/models';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(createUserInput: CreateUserInput) {
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: createUserInput.email,
          passwordHash: await hash(createUserInput.password),
          refreshTokenHash: null,
          bio: createUserInput.bio,
          firstName: createUserInput.firstName,
          lastName: createUserInput.lastName,
          birthday: createUserInput.birthday,
          nickname: createUserInput.nickname,
          sex: createUserInput.sex,
          profileImageName: null,
          settings: {
            create: {
              darkThemeEnabled: false,
              backupEnabled: false,
              commentNotificationsEnabled: true,
              friendRequestNotificationsEnabled: true,
              likeNotificationsEnabled: true,
              likesVisibilityEnabled: true,
              messageNotificationsEnabled: true,
              peopleRecommendationsEnabled: true,
              privateAccountEnabled: false,
              sensitiveContentAllowed: false,
              spamBlockEnabled: true,
              strangerMessagesEnabled: true,
              subscriptionNotificationsEnabled: true,
            },
          },
        },
      });

      this.logger.log(`Created user with id: ${user.id}`);

      const { accessToken, refreshToken } = await this.getTokens(
        createUserInput.email,
        user.id,
      );

      this.logger.log(`Created tokens for user with id: ${user.id}`);

      await this.prismaService.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshTokenHash: await hash(refreshToken),
        },
      });

      this.logger.log(`Updated user refresh token with id: ${user.id}`);

      return {
        accessToken,
        refreshToken,
      };
    } catch (e: any) {
      this.logger.error(e.message);

      throw new GraphQLError(e.message);
    }
  }

  async loginWithEmail(loginDto: LoginWithEmailInput): Promise<TokensResponse> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email: loginDto.email,
        },
      });

      if (!user || !(await verify(user.passwordHash, loginDto.password)))
        throw new UnauthorizedException();

      this.logger.log(`Found user with email: ${loginDto.email}`);

      const { accessToken, refreshToken } = await this.getTokens(
        user.email,
        user.id,
      );

      this.logger.log(`Created tokens for user with id: ${user.id}`);

      await this.updateRefreshTokenHash(user.id, await hash(refreshToken));

      this.logger.log(`Updated user refresh token with id: ${user.id}`);

      return {
        accessToken,
        refreshToken,
      };
    } catch (e: any) {
      this.logger.error(e.message);

      throw new GraphQLError(e.message);
    }
  }

  async updateUser(
    userId: number,
    updateUserInput: UpdateUserInput,
  ): Promise<CommonResponse> {
    const fieldToUpdate = {};

    for (const [key, value] of Object.entries(updateUserInput)) {
      if (!value) {
        continue;
      } else if (key === 'password') {
        const passwordHash = await hash(value);

        fieldToUpdate['passwordHash'] = passwordHash;
      } else {
        fieldToUpdate[key] = value;
      }
    }

    try {
      await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          ...fieldToUpdate,
        },
      });

      this.logger.log(`Updated user with id: ${userId}`);

      return {
        succeeded: true,
      };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async getUserById(userId: number) {
    try {
      const result = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!result) {
        throw new UnauthorizedException('User not found');
      }

      this.logger.log(`Found user with id: ${userId}`);

      return result;
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async getAllUsers() {
    try {
      this.logger.log('Fetching all users...');

      return this.prismaService.user.findMany();
    } catch (e) {
      this.logger.error(e.message);

      throw new GraphQLError(e.message);
    }
  }

  async checkForEmailExistence(
    checkIfUserExistsByEmailInput: CheckIfUserExistsByEmailInput,
  ): Promise<ExistsResponse> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: checkIfUserExistsByEmailInput.email },
      });

      if (Boolean(user)) {
        this.logger.log(
          `Found user with email: ${checkIfUserExistsByEmailInput.email}`,
        );
      } else {
        this.logger.log(
          `No user found with email: ${checkIfUserExistsByEmailInput.email}`,
        );
      }

      return { exists: Boolean(user) };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async checkForNicknameExistence(
    checkIfUserExistsByNicknameInput: CheckIfUserExistsByNicknameInput,
  ): Promise<ExistsResponse> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          nickname: checkIfUserExistsByNicknameInput.nickname,
        },
      });

      if (Boolean(user)) {
        this.logger.log(
          `Found user with nickname: ${checkIfUserExistsByNicknameInput.nickname}`,
        );
      } else {
        this.logger.log(
          `No user found with nickname: ${checkIfUserExistsByNicknameInput.nickname}`,
        );
      }

      return { exists: Boolean(user) };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async refreshToken(userId: number, refreshToken: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (
        !user ||
        !user.refreshTokenHash ||
        !(await verify(user.refreshTokenHash, refreshToken))
      )
        throw new UnauthorizedException();

      this.logger.log(
        `Found user with id: ${userId} and refresh token is valid`,
      );

      const { accessToken, refreshToken: newRefreshToken } =
        await this.getTokens(user.email, user.id);

      this.logger.log(`Created new tokens for user with id: ${user.id}`);

      await this.updateRefreshTokenHash(user.id, await hash(refreshToken));

      this.logger.log(`Updated user refresh token with id: ${user.id}`);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (e: any) {
      throw new GraphQLError(e.message);
    }
  }

  async logout(userId: number): Promise<UserIdResponse> {
    try {
      await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          refreshTokenHash: null,
        },
      });

      this.logger.log(`Removed user refresh token with id: ${userId}`);

      return { userId };
    } catch (e: any) {
      throw new GraphQLError(e.message);
    }
  }

  async deleteAccount(userId: number) {
    try {
      await this.prismaService.user.delete({
        where: {
          id: userId,
        },
      });

      this.logger.log(`Deleted user with id: ${userId}`);

      return {
        succeeded: true,
      };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async getUserFollowers(userId: number) {
    try {
      this.logger.log(`Fetching user followers with id: ${userId}`);

      return this.prismaService.user.findMany({
        where: {
          followedBy: {
            some: {
              followedUserId: userId,
            },
          },
        },
      });
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async getUserFollowings(userId: number) {
    try {
      this.logger.log(`Fetching user followings with id: ${userId}`);

      return await this.prismaService.user.findMany({
        where: {
          following: {
            some: {
              followingUserId: userId,
            },
          },
        },
      });
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async searchUsers(searchUsersInput: SearchUsersInput) {
    try {
      const searchConditions = this.buildSearchConditions(searchUsersInput);
      const orderBy = this.buildOrderBy(searchUsersInput);

      const users = await this.prismaService.user.findMany({
        where: searchConditions,
        orderBy,
      });

      return users;
    } catch (error) {
      throw new GraphQLError(error.message);
    }
  }

  private buildSearchConditions(
    input: SearchUsersInput,
  ): Prisma.UserWhereInput {
    const searchByText = input.searchText.split(' ');
    const searchByFullName = input.searchBy === SearchBy.FULLNAME;

    const whereConditions: Prisma.UserWhereInput[] = [
      searchByFullName
        ? {
            AND: [
              {
                firstName: {
                  contains: searchByText[0],
                },
              },
              {
                lastName: {
                  contains: searchByText[1],
                },
              },
            ],
          }
        : {
            nickname: {
              contains: input.searchText,
            },
          },
    ];

    if (input.withPostsOnly) {
      whereConditions.push({
        NOT: {
          posts: {
            none: {},
          },
        },
      });
    }

    if (input.sex !== SexFilter.ALL) {
      whereConditions.push({
        sex: input.sex === SexFilter.MALES ? 'MALE' : 'FEMALE',
      });
    }

    return {
      AND: whereConditions,
    };
  }

  private buildOrderBy(
    input: SearchUsersInput,
  ): Prisma.UserOrderByWithRelationInput[] {
    return input.sortBy === SortBy.FULLNAME
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
        ];
  }

  async updateRefreshTokenHash(
    userId: number,
    refreshTokenHash: string,
  ): Promise<void> {
    try {
      const user = await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          refreshTokenHash,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async getTokens(email: string, userId: number) {
    try {
      const [at, rt] = await Promise.all([
        this.jwtService.signAsync(
          {
            email,
            userId,
          },
          {
            secret: this.configService.get('AT_SECRET'),
            expiresIn: '1h',
          },
        ),
        this.jwtService.signAsync(
          {
            email,
            userId,
          },
          {
            secret: this.configService.get('RT_SECRET'),
            expiresIn: '30d',
          },
        ),
      ]);

      return {
        accessToken: at,
        refreshToken: rt,
      };
    } catch (e: any) {
      throw new GraphQLError(e.message);
    }
  }
}
