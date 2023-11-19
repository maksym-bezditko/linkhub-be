import { Field, InputType } from '@nestjs/graphql';
import { Sex } from '@prisma/client';
import {
  IsDateString,
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
  @IsEmail()
  @Field()
  email: string;

  @IsString()
  @MinLength(6)
  @Field()
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  @ValidateIf((_, value) => value !== null)
  @Field({ nullable: true })
  bio: string | null;

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
  @IsEnum(Sex)
  sex: Sex;

  @Field()
  @IsDateString()
  birthday: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  @Field()
  nickname: string;
}
