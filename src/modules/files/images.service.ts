import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CUSTOM_PROVIDERS_NAMES } from 'src/models';
import * as sharp from 'sharp';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    @Inject(CUSTOM_PROVIDERS_NAMES.S3_CLIENT)
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async getImageUrl(name: string) {
    try {
      const getCommand = new GetObjectCommand({
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: name,
      });

      const url = await getSignedUrl(this.s3Client, getCommand, {
        expiresIn: 3600,
      });

      this.logger.log('Created a signed URL for image: ' + name);

      return {
        name: name,
        url,
      };
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to get signed URL: ' + e.message,
      );
    }
  }

  async putImage(
    file: Express.Multer.File,
    resizeOptions: sharp.ResizeOptions,
    imageName: string,
  ) {
    try {
      const formattedImageBuffer = await sharp(file.buffer)
        .resize(resizeOptions)
        .toBuffer();

      const putCommand = new PutObjectCommand({
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: imageName,
        Body: formattedImageBuffer,
        ContentType: file.mimetype,
      });

      return this.s3Client.send(putCommand);
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to upload image: ' + e.message,
      );
    }
  }

  async deleteImage(name: string) {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: name,
      });

      await this.s3Client.send(deleteCommand);
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to delete image: ' + e.message,
      );
    }
  }
}
