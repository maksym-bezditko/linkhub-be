import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsResolver } from './follows.resolver';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [FollowsResolver, FollowsService],
  exports: [FollowsService],
})
export class FollowsModule {}
