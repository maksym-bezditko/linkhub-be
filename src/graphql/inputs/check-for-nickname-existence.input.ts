import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CheckForNicknameExistenceInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  nickname: string;
}
