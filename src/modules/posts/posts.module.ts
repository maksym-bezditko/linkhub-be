import { Module, forwardRef } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { DatabaseModule } from 'src/modules/database/database.module';
import { FilesModule } from '../files/files.module';
import { AuthModule } from '../auth/auth.module';
import { HashtagsModule } from '../hashtags/hashtags.module';
import { LikesModule } from '../likes/likes.module';

@Module({
  imports: [
    DatabaseModule,
    FilesModule,
    HashtagsModule,
    LikesModule,
    forwardRef(() => AuthModule),
  ],
  providers: [PostsResolver, PostsService],
  exports: [PostsService],
})
export class PostsModule {}
