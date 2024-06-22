import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Image, PROFILE_IMAGE_RESIZE_OPTIONS } from 'src/models';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../database/prisma.service';
import { CommonResponse } from 'src/graphql/responses';
import { ImagesService } from './images.service';

@Injectable()
export class ProfileImagesService {
  private readonly logger = new Logger(ProfileImagesService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly imagesService: ImagesService,
  ) {}

  async uploadImage(file: Express.Multer.File, ownerId: number) {
    try {
      await this.deleteProfileImage(ownerId);

      this.logger.log('Deleted old profile image for user with id: ' + ownerId);
    } catch (e) {
      this.logger.error('Failed to delete old profile image' + e.message);
    }

    try {
      const imageName = uuid();

      await this.imagesService.putImage(
        file,
        PROFILE_IMAGE_RESIZE_OPTIONS,
        imageName,
      );

      this.logger.log(
        'Uploaded new profile image for user with id: ' + ownerId,
      );

      await this.prismaService.user.update({
        where: {
          id: ownerId,
        },
        data: {
          profileImageName: imageName,
        },
      });

      this.logger.log(
        'Updated profile image name for user with id: ' + ownerId,
      );

      return this.retrieveImage(ownerId);
    } catch (e) {
      this.logger.error('Failed to upload image: ' + e.message);

      throw new InternalServerErrorException(
        'Failed to upload image: ' + e.message,
      );
    }
  }

  async retrieveImage(ownerId: number): Promise<Image> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: ownerId,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.profileImageName) {
        throw new NotFoundException();
      }

      return this.imagesService.getImageUrl(user.profileImageName);
    } catch (e) {
      this.logger.error('Failed to retrieve image: ' + e.message);

      throw new InternalServerErrorException(
        'Failed to retrieve image: ' + e.message,
      );
    }
  }

  async deleteProfileImage(ownerId: number): Promise<CommonResponse> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: ownerId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const imageName = user.profileImageName;

      if (!imageName) {
        throw new NotFoundException('Image not found');
      }

      await this.imagesService.deleteImage(imageName);

      this.logger.log('Deleted image for user with id: ' + ownerId);

      await this.prismaService.user.update({
        where: {
          id: ownerId,
        },
        data: {
          profileImageName: null,
        },
      });

      this.logger.log(
        'Updated profile image name for user with id: ' + ownerId,
      );

      return { succeeded: true };
    } catch (e) {
      this.logger.error('Failed to delete image: ' + e.message);

      throw new UnauthorizedException('Failed to delete image: ' + e.message);
    }
  }
}
