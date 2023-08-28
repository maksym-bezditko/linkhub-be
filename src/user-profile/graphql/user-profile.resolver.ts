import { Resolver, Query, Args } from '@nestjs/graphql';
import { UserProfileService } from '../user-profile.service';
import { UserProfile } from './definitions/response/user-profile.definition';

@Resolver()
export class UserProfileResolver {
  constructor(private readonly userService: UserProfileService) {}

  @Query(() => UserProfile)
  user(@Args('id') id: string) {
    return this.userService.findOne(id);
  }
}
