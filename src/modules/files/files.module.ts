import { Module } from '@nestjs/common';
import { PostImagesService } from './post-images.service';
import { ProfileImagesService } from './profile-images.service';
import { FilesController } from './files.controller';
import { DatabaseModule } from '../database/database.module';
import { S3ClientProvider } from 'src/providers/s3.provider';
import { ImagesService } from './images.service';

@Module({
  imports: [DatabaseModule],
  controllers: [FilesController],
  providers: [
    ImagesService,
    PostImagesService,
    ProfileImagesService,
    S3ClientProvider,
  ],
  exports: [ImagesService],
})
export class FilesModule {}
