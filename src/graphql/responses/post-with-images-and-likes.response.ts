import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from '@prisma/client';
import { PostImageResponse } from './post-image.response';
import { LikeResponse } from './like.response';
import { PostOwnerResponse } from './post-owner.response';

@ObjectType()
export class PostWithImagesAndLikesResponse implements Partial<Post> {
  @Field()
  id: string;

  @Field(() => PostOwnerResponse)
  user: PostOwnerResponse;

  @Field({ nullable: true })
  caption: string;

  @Field({ nullable: true })
  location: string;

  @Field(() => [PostImageResponse])
  postImages: PostImageResponse[];

  @Field(() => [LikeResponse])
  likes: LikeResponse[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
