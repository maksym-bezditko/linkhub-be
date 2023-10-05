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
import { CUSTOM_PROVIDERS_NAMES, POST_IMAGE_RESIZE_OPTIONS } from 'src/models';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as sharp from 'sharp';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../database/prisma.service';
import { PostImage, ProfileImage } from '@prisma/client';

@Injectable()
export class PostImagesService {
  constructor(
    @Inject(CUSTOM_PROVIDERS_NAMES.S3_CLIENT)
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async checkImageBelongsToOwner(name: string, ownerId: string) {
    let image: PostImage | ProfileImage | null;

    try {
      image = await this.prismaService.profileImage.findUnique({
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

  async uploadImage(
    file: Express.Multer.File,
    ownerId: string,
    postId: string,
  ) {
    let formattedImageBuffer: Buffer;

    try {
      formattedImageBuffer = await sharp(file.buffer)
        .resize(POST_IMAGE_RESIZE_OPTIONS)
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
      await this.prismaService.postImage.create({
        data: {
          name: imageName,
          ownerId,
          postId,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to upload image to Prisma: ' + e.message,
      );
    }

    return this.retrieveImage(imageName, ownerId);
  }

  async retrieveImage(name: string, ownerId: string) {
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

    let imageId: string;

    try {
      const image = await this.prismaService.postImage.findUnique({
        where: {
          name,
        },
      });

      if (!image) throw new Error('image not found');

      imageId = image.id;
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to get the image from the DB: ' + e.message,
      );
    }

    return {
      imageId,
      name: name,
      url,
    };
  }

  async deleteImage(name: string, ownerId: string) {
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
      await this.prismaService.postImage.delete({
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
