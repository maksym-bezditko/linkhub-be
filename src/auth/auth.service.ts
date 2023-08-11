import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { hash, verify } from 'argon2';
import { LoginWithEmailDto } from './dto/login-with-email.dto';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(registerDto: RegisterDto) {
    const user = await this.prismaService.user.create({
      data: {
        email: registerDto.email,
        passwordHash: await hash(registerDto.password),
        userName: registerDto.userName,
        authInfo: {
          create: {
            accessToken: await this.jwtService.signAsync({
              email: registerDto.email,
              userName: registerDto.userName,
            }),
            refreshToken: randomBytes(54).toString('hex'),
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
      include: {
        authInfo: {
          select: {
            accessToken: true,
            refreshToken: true,
            createdAt: true,
          },
        },
      },
    });

    Reflect.deleteProperty(user, 'passwordHash');

    return user;
  }

  async loginWithEmail(loginDto: LoginWithEmailDto): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: loginDto.email,
      },
      include: {
        authInfo: {
          select: {
            accessToken: true,
            refreshToken: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user || !(await verify(user.passwordHash, loginDto.password)))
      throw new UnauthorizedException();

    Reflect.deleteProperty(user, 'passwordHash');

    return user;
  }
}
