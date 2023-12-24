import { Field, ObjectType } from '@nestjs/graphql';
import { Like } from '@prisma/client';

@ObjectType()
export class LikeResponse implements Partial<Like> {
  @Field()
  userId: number;

  @Field()
  postId: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
