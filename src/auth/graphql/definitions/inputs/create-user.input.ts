import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @Field()
  userName: string;

  @Field()
  password: string;

  @Field()
  fullName: string;

  @Field({ nullable: true })
  bio: string | null;

  @Field({ nullable: true })
  profileLink: string | null;
}
