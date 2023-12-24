import { Resolver, Query } from '@nestjs/graphql';
import { StatsService } from './stats.service';
import { FollowsByAgeStatsResponse } from 'src/graphql/responses/follows-by-age-stats.response';
import { UserStats } from 'src/graphql/responses/user-stats.response';

@Resolver(() => FollowsByAgeStatsResponse)
export class StatsResolver {
  constructor(private readonly statsService: StatsService) {}

  @Query(() => FollowsByAgeStatsResponse)
  getFollowsByAgeStats() {
    return this.statsService.getFollowsByAgeStats();
  }

  @Query(() => [UserStats])
  getUsersStats() {
    return this.statsService.getUsersStats();
  }

  @Query(() => [UserStats])
  getUsersWithTopPosts() {
    return this.statsService.getUsersWithTopPosts();
  }

  @Query(() => [UserStats])
  getUsersWithTopFollows() {
    return this.statsService.getUsersWithTopFollows();
  }
}
