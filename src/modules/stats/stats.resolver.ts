import { Resolver, Query } from '@nestjs/graphql';
import { StatsService } from './stats.service';
import { FollowsByAgeStatsResponse } from 'src/graphql/responses/get-follows-by-age-stats.response';

@Resolver(() => FollowsByAgeStatsResponse)
export class StatsResolver {
  constructor(private readonly statsService: StatsService) {}

  @Query(() => FollowsByAgeStatsResponse)
  getFollowsByAgeStats() {
    return this.statsService.getFollowsByAgeStats();
  }
}
