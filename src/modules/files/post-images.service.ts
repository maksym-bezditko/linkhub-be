import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Image, POST_IMAGE_RESIZE_OPTIONS } from 'src/models';
import { ImagesService } from './images.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PostImagesService {
  private readonly logger = new Logger(PostImagesService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly imagesService: ImagesService,
  ) {}

  async checkImageBelongsToOwner(name: string, ownerId: number) {
    try {
      const image = await this.prismaService.postImage.findUnique({
        where: {
          name,
        },
      });

      if (!image) throw new NotFoundException();

      if (image.ownerId !== ownerId) throw new UnauthorizedException();
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to check for image ownership: ' + e.message,
      );
    }
  }

  async uploadImages(
    files: Express.Multer.File[],
    ownerId: number,
    postId: number,
  ) {
    const imageData: Image[] = [];

    for (const file of files) {
      const uploadResult = await this.uploadImage(file, ownerId, postId);

      imageData.push(uploadResult);
    }

    return imageData;
  }

  async uploadImage(
    file: Express.Multer.File,
    ownerId: number,
    postId: number,
  ) {
    try {
      const imageName = uuid();

      await this.imagesService.putImage(
        file,
        POST_IMAGE_RESIZE_OPTIONS,
        imageName,
      );

      this.logger.log('Uploaded image for post with id: ' + postId);

      await this.prismaService.postImage.create({
        data: {
          name: imageName,
          ownerId,
          postId,
        },
      });

      this.logger.log('Created image for post with id: ' + postId);

      return this.retrieveImage(imageName, ownerId);
    } catch (e) {
      this.logger.error('Failed to upload image: ' + e.message);

      throw new InternalServerErrorException(
        'Failed to upload image: ' + e.message,
      );
    }
  }

  async retrieveImage(name: string, ownerId: number): Promise<Image> {
    try {
      await this.checkImageBelongsToOwner(name, ownerId);

      return this.imagesService.getImageUrl(name);
    } catch (e) {
      this.logger.error('Failed to retrieve image: ' + e.message);

      throw new InternalServerErrorException(
        'Failed to retrieve image: ' + e.message,
      );
    }
  }

  async deleteImage(name: string, ownerId: number) {
    await this.checkImageBelongsToOwner(name, ownerId);

    try {
      await this.imagesService.deleteImage(name);

      this.logger.log('Deleted image for post with id from S3: ' + name);

      await this.prismaService.postImage.delete({
        where: {
          name,
        },
      });

      this.logger.log('Deleted image for post with id: ' + name);
    } catch (e) {
      this.logger.error('Failed to delete an image: ' + e.message);

      throw new InternalServerErrorException(
        'Failed to delete an image: ' + e.message,
      );
    }
  }
}
