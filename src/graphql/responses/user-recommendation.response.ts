import { Field, ObjectType } from '@nestjs/graphql';
import { Sex, User } from '@prisma/client';
import { FollowResponse } from './follow.response';

@ObjectType()
export class UserRecommendationResponse implements Partial<User> {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  passwordHash: string;

  @Field()
  refreshTokenHash: string;

  @Field({ nullable: true })
  bio: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  sex: Sex;

  @Field(() => [FollowResponse])
  followedBy: FollowResponse[];

  @Field(() => [FollowResponse])
  following: FollowResponse[];

  @Field()
  nickname: string;

  @Field({ nullable: true })
  profileImageName: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
