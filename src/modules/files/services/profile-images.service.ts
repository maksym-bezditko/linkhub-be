import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CUSTOM_PROVIDERS_NAMES,
  PROFILE_IMAGE_RESIZE_OPTIONS,
} from 'src/models';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as sharp from 'sharp';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../database/prisma.service';
import { PostImage, Profile, ProfileImage } from '@prisma/client';

@Injectable()
export class ProfileImagesService {
  constructor(
    @Inject(CUSTOM_PROVIDERS_NAMES.S3_CLIENT)
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async checkImageExists(ownerId: string) {
    let image: PostImage | ProfileImage | null;

    try {
      image = await this.prismaService.profileImage.findUnique({
        where: {
          ownerId,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to check for image ownership: ' + e.message,
      );
    }

    if (!image) throw new NotFoundException();

    if (image.ownerId !== ownerId) throw new UnauthorizedException();
  }

  async ensureOwnersProfile(ownerId: string) {
    let profile: Profile | null;

    try {
      profile = await this.prismaService.profile.findFirst({
        where: {
          user: {
            id: ownerId,
          },
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to find profile by ownerId',
        e.message,
      );
    }

    if (!profile || !profile.id)
      throw new NotFoundException('Profile not found');

    return profile;
  }

  async uploadImage(file: Express.Multer.File, ownerId: string) {
    const profile = await this.ensureOwnersProfile(ownerId);

    // remove existing profile images if exists
    try {
      await this.prismaService.profileImage.deleteMany({
        where: {
          profile: {
            id: profile.id,
          },
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to delete an existing image associated with the profile',
        e.message,
      );
    }

    let formattedImageBuffer: Buffer;

    try {
      formattedImageBuffer = await sharp(file.buffer)
        .resize(PROFILE_IMAGE_RESIZE_OPTIONS)
        .toBuffer();
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to resize image: ' + e.message,
      );
    }

    const imageName = uuid();

    let putCommand: PutObjectCommand;

    try {
      putCommand = new PutObjectCommand({
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: imageName,
        Body: formattedImageBuffer,
        ContentType: file.mimetype,
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to create a PUT command: ' + e.message,
      );
    }

    try {
      await this.s3Client.send(putCommand);
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to execute a PUT command: ' + e.message,
      );
    }

    try {
      await this.prismaService.profileImage.create({
        data: {
          name: imageName,
          ownerId,
          profileId: profile.id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to upload image to Prisma: ' + e.message,
      );
    }

    return this.retrieveImage(ownerId);
  }

  async retrieveImage(ownerId: string) {
    await this.checkImageExists(ownerId);

    let image: ProfileImage;

    try {
      image = await this.prismaService.profileImage.findUnique({
        where: {
          ownerId,
        },
      });

      if (!image) throw new Error('image not found');
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to get the image from the DB: ' + e.message,
      );
    }

    let getCommand: GetObjectCommand;

    try {
      getCommand = new GetObjectCommand({
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: image.name,
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to create a GET command: ' + e.message,
      );
    }

    let url: string;

    try {
      url = await getSignedUrl(this.s3Client, getCommand, { expiresIn: 3600 });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to get signed URL: ' + e.message,
      );
    }

    return {
      imageId: image.id,
      name: image.name,
      url,
    };
  }

  async deleteImage(name: string, ownerId: string) {
    await this.checkImageExists(ownerId);

    let deleteCommand: DeleteObjectCommand;

    try {
      deleteCommand = new DeleteObjectCommand({
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: name,
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to create a DELETE command: ' + e.message,
      );
    }

    try {
      await this.s3Client.send(deleteCommand);
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to execute a DELETE command: ' + e.message,
      );
    }

    try {
      await this.prismaService.profileImage.delete({
        where: {
          name,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to delete the image from database: ' + e.message,
      );
    }
  }
}
