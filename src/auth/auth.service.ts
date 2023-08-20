import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthInfo } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { hash, verify } from 'argon2';
import { LoginWithEmailDto } from './dto/login-with-email.dto';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

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

  async getTokens(email: string, userId: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          email,
          userId,
        },
        {
          secret: this.configService.get('AT_SECRET'),
          expiresIn: 15 * 60,
        },
      ),
      this.jwtService.signAsync(
        {
          email,
          userId,
        },
        {
          secret: this.configService.get('RT_SECRET'),
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async updateAuthInfo(userId: string, authInfo: Partial<AuthInfo>) {
    await this.prismaService.user.update({
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
  }

  async createUser(registerDto: RegisterDto) {
    const userId = uuidv4();

    const { accessToken, refreshToken } = await this.getTokens(
      registerDto.email,
      userId,
    );

    await this.prismaService.user.create({
      data: {
        id: userId,
        email: registerDto.email,
        passwordHash: await this.hashData(registerDto.password),
        userName: registerDto.userName,
        authInfo: {
          create: {
            refreshTokenHash: await this.hashData(refreshToken),
          },
        },
        userInfo: {
          create: {
            bio: registerDto.bio,
            fullName: registerDto.fullName,
            profileLink: registerDto.profileLink,
          },
        },
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async loginWithEmail(loginDto: LoginWithEmailDto) {
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
  }

  async logout(userId: string) {
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
  }

  async refreshToken(userId: string, refreshToken: string) {
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

    const { accessToken, refreshToken: newRefreshToken } = await this.getTokens(
      user.email,
      user.id,
    );

    await this.updateAuthInfo(user.id, {
      refreshTokenHash: await this.hashData(refreshToken),
    });

    return {
      accessToken,
      newRefreshToken,
    };
  }
}
