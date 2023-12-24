import { Field, ObjectType } from '@nestjs/graphql';
import { PostImage } from '@prisma/client';

@ObjectType()
export class PostImageResponse implements Partial<PostImage> {
  @Field()
  id: number;

  @Field()
  url: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
