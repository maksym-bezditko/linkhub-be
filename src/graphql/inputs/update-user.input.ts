import { Field, InputType } from '@nestjs/graphql';
import { Sex } from '@prisma/client';
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
export class UpdateUserInput {
  @IsEmail()
  @Field()
  @ValidateIf((_, value) => value !== null)
  @Field({ nullable: true })
  email: string | null;

  @IsString()
  @MinLength(6)
  @Field()
  @ValidateIf((_, value) => value !== null)
  @Field({ nullable: true })
  password: string | null;

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
  @ValidateIf((_, value) => value !== null)
  @Field({ nullable: true })
  firstName: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Field()
  @ValidateIf((_, value) => value !== null)
  @Field({ nullable: true })
  lastName: string | null;

  @Field()
  @IsEnum(Sex)
  @ValidateIf((_, value) => value !== null)
  @Field({ nullable: true })
  sex: Sex | null;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  @Field()
  @ValidateIf((_, value) => value !== null)
  @Field({ nullable: true })
  nickname: string | null;
}
