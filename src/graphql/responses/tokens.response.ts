import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokensResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}
