import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { DatabaseModule } from 'src/modules/database/database.module';
import { PrismaService } from 'src/modules/database/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getJwtConfig } from 'src/config/getJwtConfig';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  imports: [
    DatabaseModule,

    ConfigModule.forRoot(),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    PrismaService,
    JwtService,
    AtStrategy,
    RtStrategy,
  ],
})
export class AuthModule {}
