import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from '@prisma/client';

@ObjectType()
export class PostResponse implements Partial<Post> {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  caption: string;

  @Field({ nullable: true })
  location: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
