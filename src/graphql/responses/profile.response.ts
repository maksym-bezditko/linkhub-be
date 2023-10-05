import { Field, ObjectType } from '@nestjs/graphql';
import { Gender, Profile } from '@prisma/client';

@ObjectType()
export class ProfileResponse implements Partial<Profile> {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  bio: string;

  @Field()
  firstName: string;

  @Field()
  gender: Gender;

  @Field()
  lastName: string;

  @Field()
  userName: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
