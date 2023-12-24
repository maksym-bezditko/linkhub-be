import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from '@prisma/client';
import { PostOwnerResponse } from './post-owner.response';

@ObjectType()
export class PostResponse implements Partial<Post> {
  @Field()
  id: number;

  @Field(() => PostOwnerResponse)
  user: PostOwnerResponse;

  @Field({ nullable: true })
  caption: string;

  @Field({ nullable: true })
  location: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
