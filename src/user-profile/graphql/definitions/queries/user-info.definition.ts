import { ObjectType, Field, GraphQLISODateTime } from '@nestjs/graphql';
import { UserInfo as UserInfoType } from '@prisma/client';

@ObjectType()
export class UserInfo implements Partial<UserInfoType> {
  @Field()
  id: string;

  @Field({ nullable: true })
  bio: string | null;

  @Field({ nullable: true })
  profileLink: string | null;

  @Field()
  fullName: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
