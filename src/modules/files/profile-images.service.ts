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
  Image,
  PROFILE_IMAGE_RESIZE_OPTIONS,
} from 'src/models';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as sharp from 'sharp';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../database/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class ProfileImagesService {
  constructor(
    @Inject(CUSTOM_PROVIDERS_NAMES.S3_CLIENT)
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async uploadImage(file: Express.Multer.File, ownerId: string) {
    try {
      await this.deleteProfileImage(ownerId);
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to delete old profile image: ' + e.message,
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
      await this.prismaService.user.update({
        where: {
          id: ownerId,
        },
        data: {
          profileImageName: imageName,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to upload image to Prisma: ' + e.message,
      );
    }

    return this.retrieveImage(ownerId);
  }

  async retrieveImage(ownerId: string): Promise<Image> {
    let user: User;

    try {
      user = await this.prismaService.user.findUnique({
        where: {
          id: ownerId,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to get the image from the DB: ' + e.message,
      );
    }

    if (!user.profileImageName) {
      throw new NotFoundException();
    }

    let getCommand: GetObjectCommand;

    try {
      getCommand = new GetObjectCommand({
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: user.profileImageName,
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
      name: user.profileImageName,
      url,
    };
  }

  async deleteProfileImage(ownerId: string) {
    let user: User | null;

    try {
      user = await this.prismaService.user.findUnique({
        where: { id: ownerId },
      });
    } catch (e) {
      throw new UnauthorizedException('Failed to find the user: ' + e.message);
    }

    const imageName = user.profileImageName;

    if (!imageName) {
      return;
    }

    let deleteCommand: DeleteObjectCommand;

    try {
      deleteCommand = new DeleteObjectCommand({
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: imageName,
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
      await this.prismaService.user.update({
        where: {
          id: ownerId,
        },
        data: {
          profileImageName: null,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to delete the image from database: ' + e.message,
      );
    }
  }
}
