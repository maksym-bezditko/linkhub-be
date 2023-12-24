import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Stats {
  @Field()
  to10: number;

  @Field()
  to20: number;

  @Field()
  to30: number;

  @Field()
  to40: number;

  @Field()
  to50: number;

  @Field()
  to60: number;

  @Field()
  to70: number;

  @Field()
  to80: number;
}

@ObjectType()
export class FollowsByAgeStatsResponse {
  @Field(() => Stats)
  male: Stats;

  @Field(() => Stats)
  female: Stats;
}
