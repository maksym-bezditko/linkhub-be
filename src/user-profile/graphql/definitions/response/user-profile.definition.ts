import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { User as UserType } from '@prisma/client';
import { UserInfo } from './user-info.definition';

@ObjectType()
export class UserProfile implements Partial<UserType> {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  userName: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => UserInfo)
  userInfo: UserInfo;
}
