import { S3Client } from '@aws-sdk/client-s3';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CUSTOM_PROVIDERS_NAMES } from 'src/models';

export const S3ClientProvider: Provider = {
  provide: CUSTOM_PROVIDERS_NAMES.S3_CLIENT,
  useFactory: (configService: ConfigService) =>
    new S3Client({
      credentials: {
        accessKeyId: configService.get('S3_ACCESS_KEY') || '',
        secretAccessKey: configService.get('S3_SECRET_KEY') || '',
      },
      region: configService.get('S3_REGION') || '',
    }),
  inject: [ConfigService],
};
