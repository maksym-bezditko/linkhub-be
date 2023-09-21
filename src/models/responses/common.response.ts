import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CommonResponse {
  @Field()
  succeeded: boolean;
}
