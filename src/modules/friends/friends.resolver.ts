import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AtJwtGuard } from '../auth/guards/jwt-at.guard';
import { UserIdFromJwt } from 'src/decorators/user-id-from-jwt.decorator';
import { FriendsService } from './friends.service';
import { UserResponse } from 'src/graphql/responses/user.response';
import { CommonResponse } from 'src/graphql/responses/common.response';
import { FollowUserInput } from 'src/graphql/inputs/follow-user.input';
import { UnfollowUserInput } from 'src/graphql/inputs/unfollow-user.input';

@Resolver(() => UserResponse)
export class FriendsResolver {
  constructor(private readonly friendsService: FriendsService) {}

  @UseGuards(AtJwtGuard)
  @Query(() => [UserResponse])
  getRecommendations(@UserIdFromJwt() userId: string) {
    return this.friendsService.getRecommendations(userId);
  }

  @UseGuards(AtJwtGuard)
  @Mutation(() => CommonResponse)
  followUser(
    @UserIdFromJwt() userId: string,
    @Args('followUserInput') followUserInput: FollowUserInput,
  ) {
    return this.friendsService.followUser(followUserInput, userId);
  }

  @UseGuards(AtJwtGuard)
  @Mutation(() => CommonResponse)
  unfollowUser(
    @UserIdFromJwt() userId: string,
    @Args('unfollowUserInput') unlikePostInput: UnfollowUserInput,
  ) {
    return this.friendsService.unfollowUser(unlikePostInput, userId);
  }
}
