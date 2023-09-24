import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthInfo, User } from '@prisma/client';
import { hash, verify } from 'argon2';
import { PrismaService } from 'src/modules/database/prisma.service';
import { UserIdResponse } from '../../graphql/responses/user-id.response';
import { Tokens } from '../../graphql/responses/tokens.response';
import { GraphQLError } from 'graphql';
import { LoginWithEmailInput } from '../../graphql/inputs/login-with-email.input';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserInput } from '../../graphql/inputs/create-user.input';
import { CheckForEmailExistenceInput } from '../../graphql/inputs/check-for-email-existence.input';
import { CommonResponse } from 'src/graphql/responses/common.response';
import { CheckForUsernameExistenceInput } from 'src/graphql/inputs/check-for-username-existence.input';

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

  async updateAuthInfo(
    userId: string,
    authInfo: Partial<AuthInfo>,
  ): Promise<Omit<User, 'passwordHash'>> {
    try {
      const user = await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          authInfo: {
            update: {
              ...authInfo,
            },
          },
        },
      });

      delete user['passwordHash'];

      return user;
    } catch (e: any) {
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

  async loginWithEmail(loginDto: LoginWithEmailInput): Promise<Tokens> {
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

      await this.updateAuthInfo(user.id, {
        refreshTokenHash: await this.hashData(refreshToken),
      });

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
          authInfo: {
            create: {
              refreshTokenHash: await this.hashData(refreshToken),
            },
          },
          profile: {
            create: {
              bio: createUserInput.bio,
              fullName: createUserInput.fullName,
              userName: createUserInput.userName,
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
      const user = await this.prismaService.user.findFirst({
        where: { email: checkForEmailExistenceInput.email },
      });

      if (user) throw new Error('User already exists');

      return { succeeded: true };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }

  async checkForUsernameExistence(
    checkForUsernameExistenceInput: CheckForUsernameExistenceInput,
  ): Promise<CommonResponse> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          profile: { userName: checkForUsernameExistenceInput.userName },
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
          authInfo: {
            update: {
              data: {
                refreshTokenHash: null,
              },
            },
          },
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
        include: {
          authInfo: true,
        },
      });

      if (
        !user ||
        !user.authInfo.refreshTokenHash ||
        !(await verify(user.authInfo.refreshTokenHash, refreshToken))
      )
        throw new UnauthorizedException();

      const { accessToken, refreshToken: newRefreshToken } =
        await this.getTokens(user.email, user.id);

      await this.updateAuthInfo(user.id, {
        refreshTokenHash: await this.hashData(refreshToken),
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (e: any) {
      throw new GraphQLError(e.message);
    }
  }
}
