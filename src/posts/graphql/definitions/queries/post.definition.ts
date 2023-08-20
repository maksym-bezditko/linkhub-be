import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Post as PostType } from '@prisma/client';

@ObjectType()
export class Post implements PostType {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  photoLink: string;

  @Field()
  caption: string;

  @Field()
  location: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
