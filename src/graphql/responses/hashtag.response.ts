import { Field, ObjectType } from '@nestjs/graphql';
import { Hashtag } from '@prisma/client';

@ObjectType()
export class HashtagResponse implements Partial<Hashtag> {
  @Field()
  id: number;

  @Field()
  name: string;
}
