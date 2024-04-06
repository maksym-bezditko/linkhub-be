import { Field, InputType, registerEnumType } from '@nestjs/graphql';
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
import { SearchBy, SortBy, SexFilter } from 'src/models';
import { Post, Sex } from '@prisma/client';

registerEnumType(Sex, { name: 'Sex' });
registerEnumType(SexFilter, { name: 'SexFilter' });

@InputType()
export class UpdateUserInput {
  @IsEmail()
  @ValidateIf((_, value) => value !== null)
  @Field(() => String, { nullable: true })
  email: string | null;

  @IsString()
  @MinLength(6)
  @ValidateIf((_, value) => value !== null)
  @Field(() => String, { nullable: true })
  password: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  @ValidateIf((_, value) => value !== null)
  @Field(() => String, { nullable: true })
  bio: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ValidateIf((_, value) => value !== null)
  @Field(() => String, { nullable: true })
  firstName: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ValidateIf((_, value) => value !== null)
  @Field(() => String, { nullable: true })
  lastName: string | null;

  @IsDateString()
  @ValidateIf((_, value) => value !== null)
  @Field(() => String, { nullable: true })
  birthday: string | null;

  @IsEnum(Sex)
  @ValidateIf((_, value) => value !== null)
  @Field(() => Sex, { nullable: true })
  sex: Sex | null;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  @ValidateIf((_, value) => value !== null)
  @Field(() => String, { nullable: true })
  nickname: string | null;
}

@InputType()
export class UpdatePostInput implements Partial<Post> {
  @Field()
  id: number;

  @Field()
  photoLink: string;

  @Field()
  caption: string;

  @Field()
  location: string;
}

@InputType()
export class SearchUsersInput {
  @Field()
  @IsEnum(SearchBy)
  searchBy: SearchBy;

  @Field()
  @IsEnum(SortBy)
  sortBy: SortBy;

  @Field()
  searchText: string;

  @Field(() => SexFilter)
  @IsEnum(SexFilter)
  sex: SexFilter;

  @Field()
  withPostsOnly: boolean;
}

@InputType()
export class UnlikePostInput {
  @Field()
  postId: number;
}

@InputType()
export class LoginWithEmailInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class LikePostInput {
  @Field()
  postId: number;
}

@InputType()
export class CheckIfUserExistsByEmailInput {
  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class CreatePostInput implements Partial<Post> {
  @Field()
  caption: string;

  @ValidateIf((_, value) => value !== null)
  @Field(() => String, { nullable: true })
  location: string | null;

  @Field(() => [String])
  hashtags: string[];
}

@InputType()
export class DeletePostInput {
  @Field()
  postId: number;
}

@InputType()
export class CheckIfUserExistsByNicknameInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  nickname: string;
}

@InputType()
export class CreateUserInput {
  @IsEmail()
  @Field(() => String)
  email: string;

  @IsString()
  @MinLength(6)
  @Field(() => String)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  @ValidateIf((_, value) => value !== null)
  @Field(() => String, { nullable: true })
  bio: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Field(() => String)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Field(() => String)
  lastName: string;

  @Field(() => String)
  @IsDateString()
  birthday: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  @Field(() => String)
  nickname: string;

  @IsEnum(Sex)
  @Field(() => Sex)
  sex: Sex;
}
