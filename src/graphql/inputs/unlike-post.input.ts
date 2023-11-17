import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UnlikePostInput {
  @Field()
  postId: string;
}
