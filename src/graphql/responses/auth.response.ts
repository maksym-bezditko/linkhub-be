import { Field, ObjectType } from '@nestjs/graphql';
import { Auth } from '@prisma/client';

@ObjectType()
export class AuthResponse implements Partial<Auth> {
  @Field()
  id: string;

  @Field()
  refreshTokenHash: string;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
