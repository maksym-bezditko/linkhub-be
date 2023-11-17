import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { DatabaseModule } from 'src/modules/database/database.module';
import { PrismaService } from 'src/modules/database/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CUSTOM_PROVIDERS_NAMES } from 'src/models';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports: [DatabaseModule, ConfigModule.forRoot()],
  providers: [
    PostsResolver,
    PostsService,
    PrismaService,
    {
      provide: CUSTOM_PROVIDERS_NAMES.S3_CLIENT,
      useFactory: (configService: ConfigService) =>
        new S3Client({
          credentials: {
            accessKeyId: configService.get('S3_ACCESS_KEY'),
            secretAccessKey: configService.get('S3_SECRET_KEY'),
          },
          region: configService.get('S3_REGION'),
        }),
      inject: [ConfigService],
    },
  ],
})
export class PostsModule {}
