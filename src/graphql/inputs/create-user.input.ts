import { Field, InputType } from '@nestjs/graphql';
import { Gender } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
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
  @MaxLength(50)
  @Field()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Field()
  lastName: string;

  @Field()
  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  @ValidateIf((_, value) => value !== null)
  @Field({ nullable: true })
  bio: string | null;
}
