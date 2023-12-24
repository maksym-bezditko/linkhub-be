import { Field, ObjectType } from '@nestjs/graphql';
import { Sex, User } from '@prisma/client';
import { IsEnum } from 'class-validator';

@ObjectType()
export class UserStats implements Partial<User> {
  @Field()
  id: number;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  age: number;

  @Field()
  @IsEnum(Sex)
  sex: Sex;

  @Field()
  followersNumber: number;

  @Field()
  followingNumber: number;
}
