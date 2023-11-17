import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LikePostInput {
  @Field()
  postId: string;
}
