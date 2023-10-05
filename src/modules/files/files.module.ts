import { Module } from '@nestjs/common';
import { PostImagesService } from './services/post-images.service';
import { ProfileImagesService } from './services/profile-images.service';
import { FilesController } from './files.controller';
import { CUSTOM_PROVIDERS_NAMES } from 'src/models';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [FilesController],
  providers: [
    PostImagesService,
    ProfileImagesService,
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
export class FilesModule {}
