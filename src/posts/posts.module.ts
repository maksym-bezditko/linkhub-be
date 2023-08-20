import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './graphql/posts.resolver';
import { DatabaseModule } from 'src/database/database.module';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [DatabaseModule],
  providers: [PostsResolver, PostsService, PrismaService],
})
export class PostsModule {}
