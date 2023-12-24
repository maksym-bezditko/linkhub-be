import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '@prisma/client';

@ObjectType()
export class PostOwnerResponse implements Partial<User> {
  @Field()
  id: number;

  @Field()
  nickname: string;
}
