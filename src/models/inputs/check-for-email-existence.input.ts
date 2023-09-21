import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CheckForEmailExistenceInput {
  @Field()
  email: string;
}
