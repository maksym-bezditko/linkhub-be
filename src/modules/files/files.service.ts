import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CUSTOM_PROVIDERS_NAMES, SourceInfo } from 'src/models';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as sharp from 'sharp';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../database/prisma.service';
import { Image, Profile, Role } from '@prisma/client';

@Injectable()
export class FilesService {
  constructor(
    @Inject(CUSTOM_PROVIDERS_NAMES.S3_CLIENT)
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async checkImageBelongsToOwner(name: string, ownerId: string) {
    let image: Image | null;

    try {
      image = await this.prismaService.image.findFirst({
        where: {
          name,
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

  async uploadFile(
    file: Express.Multer.File,
    ownerId: string,
    resizeOptions: sharp.ResizeOptions,
    sourceInfo: SourceInfo,
  ) {
    let formattedImageBuffer: Buffer;

    try {
      formattedImageBuffer = await sharp(file.buffer)
        .resize(resizeOptions)
        .toBuffer();
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to resize image: ' + e.message,
      );
    }

    const imageName = randomBytes(32).toString('hex');

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
      await this.prismaService.image.create({
        data: {
          role: Role.PROFILE_IMAGE,
          name: imageName,
          ownerId,
          ...sourceInfo,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to upload image to Prisma: ' + e.message,
      );
    }

    return this.retrieveFile(imageName, ownerId);
  }

  async uploadProfileImage(file: Express.Multer.File, ownerId: string) {
    let profile: Profile | null;

    try {
      profile = await this.prismaService.profile.findFirst({
        where: {
          userId: ownerId,
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

    // remove existing profile images if exists
    try {
      await this.prismaService.image.deleteMany({
        where: {
          profileId: profile.id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to delete an existing image associated with the profile',
        e.message,
      );
    }

    return this.uploadFile(
      file,
      ownerId,
      {
        height: 1920,
        width: 1920,
        fit: 'cover',
      },
      {
        profileId: profile.id,
      },
    );
  }

  async uploadPostImage(
    file: Express.Multer.File,
    ownerId: string,
    postId?: string,
  ) {
    if (!postId) throw new BadRequestException('Field postId is required');

    return this.uploadFile(
      file,
      ownerId,
      {
        height: 1920,
        width: 1080,
        fit: 'contain',
      },
      {
        postId,
      },
    );
  }

  async retrieveFile(name: string, ownerId: string) {
    await this.checkImageBelongsToOwner(name, ownerId);

    let getCommand: GetObjectCommand;

    try {
      getCommand = new GetObjectCommand({
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: name,
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
      url,
      name: name,
    };
  }

  async deleteFile(name: string, ownerId: string) {
    await this.checkImageBelongsToOwner(name, ownerId);

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
      await this.prismaService.image.delete({
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
