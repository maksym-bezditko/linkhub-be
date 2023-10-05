import { Resolver, Query } from '@nestjs/graphql';
import { ProfileService } from './profile.service';
import { ProfileResponse } from 'src/graphql/responses/profile.response';
import { UseGuards } from '@nestjs/common';
import { AtJwtGuard } from '../auth/guards/jwt-at.guard';
import { UserIdFromJwt } from 'src/decorators/user-id-from-jwt.decorator';

@Resolver()
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(AtJwtGuard)
  @Query(() => ProfileResponse)
  async getProfile(@UserIdFromJwt() userId: string | undefined) {
    return this.profileService.findUsersProfileByTheirId(userId);
  }
}
