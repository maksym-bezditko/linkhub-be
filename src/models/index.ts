import { PrismaClient } from '@prisma/client';
import * as sharp from 'sharp';

export enum CUSTOM_PROVIDERS_NAMES {
  S3_CLIENT = 'S3_CLIENT',
}

export const POST_IMAGE_RESIZE_OPTIONS: sharp.ResizeOptions = {
  height: 1920,
  width: 1080,
  fit: 'contain',
};

export const PROFILE_IMAGE_RESIZE_OPTIONS: sharp.ResizeOptions = {
  height: 1920,
  width: 1920,
  fit: 'cover',
};

export type Tables = keyof Omit<
  PrismaClient,
  | '$disconnect'
  | '$connect'
  | '$executeRaw'
  | '$queryRaw'
  | '$transaction'
  | '$on'
  | '$extends'
  | '$executeRawUnsafe'
  | '$queryRawUnsafe'
  | '$use'
>;

export type Image = {
  name: string;
  url: string;
};

export enum SearchBy {
  NICKNAME = 'nickname',
  FULLNAME = 'fullname',
}

export enum SortBy {
  FULLNAME = 'fullname',
  DATE_OF_ACCOUNT_CREATION = 'dateOfAccountCreation',
}

export enum SexFilter {
  ALL = 'all',
  MALES = 'males',
  FEMALES = 'females',
}
