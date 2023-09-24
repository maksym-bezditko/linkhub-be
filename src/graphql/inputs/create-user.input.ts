import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

@InputType()
export class CreateUserInput {
  //validation
  @IsEmail()
  // graphql
  @Field()
  email: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  @Field()
  userName: string;

  @IsString()
  @MinLength(6)
  @Field()
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Field()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  @ValidateIf((_, value) => value !== null)
  @Field({ nullable: true })
  bio: string | null;

  @ValidateIf((_, value) => value !== null)
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  @Field({ nullable: true })
  profileLink: string | null;
}
