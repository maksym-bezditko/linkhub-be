import { Field, ObjectType } from '@nestjs/graphql';
import { Sex, User } from '@prisma/client';

@ObjectType()
export class UserResponse implements Partial<User> {
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

  @Field()
  nickname: string;

  @Field({ nullable: true })
  profileImageName: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
