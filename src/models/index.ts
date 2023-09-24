import { Image } from '@prisma/client';

export enum CUSTOM_PROVIDERS_NAMES {
  S3_CLIENT = 'S3_CLIENT',
}

export type SourceInfo = Pick<Image, 'postId'> | Pick<Image, 'profileId'>;
