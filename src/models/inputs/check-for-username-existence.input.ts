import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CheckForUsernameExistenceInput {
  @Field()
  userName: string;
}
