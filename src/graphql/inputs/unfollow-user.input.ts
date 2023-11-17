import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UnfollowUserInput {
  @Field()
  userId: string;
}
