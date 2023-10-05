import { Field, ObjectType } from '@nestjs/graphql';
import { Like } from '@prisma/client';

@ObjectType()
export class LikeResponse implements Partial<Like> {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  postId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
