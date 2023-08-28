import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginWithEmailInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
