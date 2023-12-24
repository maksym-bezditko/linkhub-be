import { Field, ObjectType } from '@nestjs/graphql';
import { Follow } from '@prisma/client';

@ObjectType()
export class FollowResponse implements Partial<Follow> {
  @Field()
  followingUserId: number;

  @Field()
  followedUserId: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
