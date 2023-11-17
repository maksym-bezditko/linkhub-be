import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { hash, verify } from 'argon2';
import { PrismaService } from 'src/modules/database/prisma.service';
import { UserIdResponse } from '../../graphql/responses/user-id.response';
import { TokensResponse } from 'src/graphql/responses/tokens.response';
import { GraphQLError } from 'graphql';
import { LoginWithEmailInput } from '../../graphql/inputs/login-with-email.input';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserInput } from '../../graphql/inputs/create-user.input';
import { CheckForEmailExistenceInput } from '../../graphql/inputs/check-for-email-existence.input';
import { CommonResponse } from 'src/graphql/responses/common.response';
import { CheckForNicknameExistenceInput } from 'src/graphql/inputs/check-for-nickname-existence.input';
import { UserResponse } from 'src/graphql/responses/user.response';
import { UpdateUserInput } from 'src/graphql/inputs/update-user.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async hashData(data: string) {
    return await hash(data);
  }

  async allUsers() {
    return this.prismaService.user.findMany({
      include: {
        followedBy: true,
        following: true,
        likes: true,
        postImages: true,
        posts: true,
        settings: true,
      },
    });
  }

  async updateUser(
    userId: string,
    updateUserInput: UpdateUserInput,
  ): Promise<CommonResponse> {
    const fieldToUpdate = {};

    for (const [key, value] of Object.entries(updateUserInput)) {
      if (!value) {
        continue;
      } else if (key === 'password') {
        const passwordHash = await this.hashData(value);

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

      return {
        succeeded: true,
      };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async getUserById(userId: string): Promise<UserResponse> {
    let user: UserResponse;

    try {
      user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
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

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string,
  ): Promise<Omit<User, 'passwordHash'>> {
    try {
      const user = await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          refreshTokenHash,
        },
      });

      delete user['passwordHash'];

      return user;
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async getTokens(email: string, userId: string) {
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

  async loginWithEmail(loginDto: LoginWithEmailInput): Promise<TokensResponse> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email: loginDto.email,
        },
      });

      if (!user || !(await verify(user.passwordHash, loginDto.password)))
        throw new UnauthorizedException();

      const { accessToken, refreshToken } = await this.getTokens(
        user.email,
        user.id,
      );

      await this.updateRefreshTokenHash(
        user.id,
        await this.hashData(refreshToken),
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (e: any) {
      throw new GraphQLError(e.message);
    }
  }

  async createUser(createUserInput: CreateUserInput) {
    try {
      const userId = uuidv4();

      const { accessToken, refreshToken } = await this.getTokens(
        createUserInput.email,
        userId,
      );

      await this.prismaService.user.create({
        data: {
          id: userId,
          email: createUserInput.email,
          passwordHash: await this.hashData(createUserInput.password),
          refreshTokenHash: await this.hashData(refreshToken),
          bio: createUserInput.bio,
          firstName: createUserInput.firstName,
          lastName: createUserInput.lastName,
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

      return {
        accessToken,
        refreshToken,
      };
    } catch (e: any) {
      throw new GraphQLError(e.message);
    }
  }

  async checkForEmailExistence(
    checkForEmailExistenceInput: CheckForEmailExistenceInput,
  ): Promise<CommonResponse> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: checkForEmailExistenceInput.email },
      });

      if (user) throw new Error('User already exists');

      return { succeeded: true };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async checkForNicknameExistence(
    checkForUsernameExistenceInput: CheckForNicknameExistenceInput,
  ): Promise<CommonResponse> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          nickname: checkForUsernameExistenceInput.nickname,
        },
      });

      if (user) throw new Error('User already exists');

      return { succeeded: true };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async logout(userId: string): Promise<UserIdResponse> {
    try {
      await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          refreshTokenHash: null,
        },
      });

      return { userId };
    } catch (e: any) {
      throw new GraphQLError(e.message);
    }
  }

  async refreshToken(userId: string, refreshToken: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          refreshTokenHash: true,
          email: true,
        },
      });

      if (
        !user ||
        !user.refreshTokenHash ||
        !(await verify(user.refreshTokenHash, refreshToken))
      )
        throw new UnauthorizedException();

      const { accessToken, refreshToken: newRefreshToken } =
        await this.getTokens(user.email, user.id);

      await this.updateRefreshTokenHash(
        user.id,
        await this.hashData(refreshToken),
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (e: any) {
      throw new GraphQLError(e.message);
    }
  }
}
