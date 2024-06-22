import { Module, forwardRef } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesResolver } from './likes.resolver';
import { DatabaseModule } from '../database/database.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => PostsModule)],
  providers: [LikesResolver, LikesService],
  exports: [LikesService],
})
export class LikesModule {}
