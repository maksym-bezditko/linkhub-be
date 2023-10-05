import { Field, ObjectType } from '@nestjs/graphql';
import { PostImage } from '@prisma/client';

@ObjectType()
export class PostImageResponse implements Partial<PostImage> {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  ownerId: string;

  @Field()
  postId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
