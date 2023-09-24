import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class CheckForEmailExistenceInput {
  @Field()
  @IsEmail()
  email: string;
}
