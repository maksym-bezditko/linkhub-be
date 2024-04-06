import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { DatabaseModule } from 'src/modules/database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getJwtConfig } from 'src/config/getJwtConfig';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { PostsModule } from '../posts/posts.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    DatabaseModule,

    PostsModule,

    FilesModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [AuthResolver, AuthService, JwtService, AtStrategy, RtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
