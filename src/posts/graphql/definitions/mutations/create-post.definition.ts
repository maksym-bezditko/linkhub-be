import { InputType, Field } from '@nestjs/graphql';
import { Post as PostType } from '@prisma/client';

@InputType()
export class CreatePostInput implements Partial<PostType> {
  @Field()
  userId: string;

  @Field()
  photoLink: string;

  @Field()
  caption: string;

  @Field()
  location: string;
}
