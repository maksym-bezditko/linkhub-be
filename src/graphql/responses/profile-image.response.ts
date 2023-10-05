import { Field, ObjectType } from '@nestjs/graphql';
import { ProfileImage } from '@prisma/client';

@ObjectType()
export class ProfileImageResponse implements Partial<ProfileImage> {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  ownerId: string;

  @Field()
  profileId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
