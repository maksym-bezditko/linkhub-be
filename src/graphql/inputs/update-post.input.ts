import { InputType, Field } from '@nestjs/graphql';
import { Post as PostType } from '@prisma/client';

@InputType()
export class UpdatePostInput implements Partial<PostType> {
  @Field()
  id: number;

  @Field()
  photoLink: string;

  @Field()
  caption: string;

  @Field()
  location: string;
}
