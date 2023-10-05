import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { AuthResponse } from './auth.response';
import { ProfileResponse } from './profile.response';
import { FollowResponse } from './follow.response';
import { LikeResponse } from './like.response';
import { PostImageResponse } from './post-image.response';
import { PostResponse } from './post.response';
import { ProfileImageResponse } from './profile-image.response';

@ObjectType()
export class UserResponse implements Partial<User> {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  passwordHash: string;

  @Field()
  auth: AuthResponse;

  @Field()
  profile: ProfileResponse;

  @Field(() => [FollowResponse])
  followedBy: FollowResponse[];

  @Field(() => [FollowResponse])
  followingUsers: FollowResponse[];

  @Field(() => [LikeResponse])
  likes: LikeResponse[];

  @Field(() => [PostImageResponse])
  postImages: PostImageResponse[];

  @Field(() => [PostResponse])
  posts: PostResponse[];

  @Field({ nullable: true })
  profileImage: ProfileImageResponse;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
