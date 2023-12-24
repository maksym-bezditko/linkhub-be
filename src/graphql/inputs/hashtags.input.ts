import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class HashtagsInput {
  @Field(() => [String])
  tags: string[];
}
