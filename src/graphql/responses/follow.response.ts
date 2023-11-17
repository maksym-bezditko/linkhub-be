import { Field, ObjectType } from '@nestjs/graphql';
import { Follow } from '@prisma/client';

@ObjectType()
export class FollowResponse implements Partial<Follow> {
  @Field()
  followingUserId: string;

  @Field()
  followedUserId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
