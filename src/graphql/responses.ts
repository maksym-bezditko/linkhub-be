import { Field, ObjectType } from '@nestjs/graphql';
import { User, Sex, Post, Like, Hashtag } from '@prisma/client';

@ObjectType()
export class CommonResponse {
  @Field()
  succeeded: boolean;
}

@ObjectType()
export class UserIdResponse {
  @Field()
  userId: number;
}

@ObjectType()
export class ExistsResponse {
  @Field()
  exists: boolean;
}

@ObjectType()
export class UserResponse implements User {
  @Field()
  id: number;

  @Field()
  email: string;

  @Field()
  passwordHash: string;

  @Field(() => String, { nullable: true })
  refreshTokenHash: string | null;

  @Field(() => String, { nullable: true })
  bio: string | null;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  sex: Sex;

  @Field()
  birthday: Date;

  @Field()
  nickname: string;

  @Field(() => String, { nullable: true })
  profileImageName: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // additional fields

  @Field(() => [PostResponse])
  posts: PostResponse[];

  @Field(() => [UserResponse])
  followers: UserResponse[];

  @Field(() => [UserResponse])
  following: UserResponse[];

  @Field(() => String, { nullable: true })
  profileImage: string | null;
}

@ObjectType()
export class TokensResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}

@ObjectType()
export class PostResponse implements Post {
  @Field()
  id: number;

  @Field(() => String, { nullable: true })
  caption: string | null;

  @Field(() => String, { nullable: true })
  location: string | null;

  @Field()
  userId: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // additional fields

  @Field(() => UserResponse)
  owner: UserResponse;

  @Field(() => [HashtagResponse])
  hashtags: HashtagResponse[];

  @Field(() => [LikeResponse])
  likes: LikeResponse[];
}

@ObjectType()
export class LikeResponse implements Like {
  @Field()
  userId: number;

  @Field()
  postId: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // additional fields

  @Field(() => PostResponse, { nullable: true })
  post: PostResponse | null;
}

@ObjectType()
export class HashtagResponse implements Hashtag {
  @Field()
  id: number;

  @Field()
  name: string;
}
