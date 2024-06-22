import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { FollowsService } from './follows.service';
import { CommonResponse } from 'src/graphql/responses';
import { UseGuards } from '@nestjs/common';
import { UserIdFromJwt } from 'src/decorators/user-id-from-jwt.decorator';
import { AtJwtGuard } from '../auth/guards/jwt-at.guard';

@Resolver()
export class FollowsResolver {
  constructor(private readonly followsService: FollowsService) {}

  @UseGuards(AtJwtGuard)
  @Mutation(() => CommonResponse)
  async followUser(
    @UserIdFromJwt() userId: number,
    @Args('userIdToFollow') userIdToFollow: number,
  ) {
    return this.followsService.followUser(userIdToFollow, userId);
  }

  @UseGuards(AtJwtGuard)
  @Mutation(() => CommonResponse)
  async unfollowUser(
    @UserIdFromJwt() userId: number,
    @Args('userIdToUnfollow') userIdToUnfollow: number,
  ) {
    return this.followsService.unfollowUser(userIdToUnfollow, userId);
  }
}
