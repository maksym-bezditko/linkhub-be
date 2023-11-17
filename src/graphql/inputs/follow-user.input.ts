import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class FollowUserInput {
  @Field()
  userId: string;
}
