import { InputType, Field } from '@nestjs/graphql';
import { Post as PostType } from '@prisma/client';
import { ValidateIf } from 'class-validator';

@InputType()
export class CreatePostInput implements Partial<PostType> {
  @Field()
  caption: string;

  @Field()
  @ValidateIf((_, value) => value !== null)
  @Field({ nullable: true })
  location: string | null;

  @Field(() => [String])
  hashtags: string[];
}
