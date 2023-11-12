import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { DatabaseModule } from 'src/modules/database/database.module';
import { PrismaService } from 'src/modules/database/prisma.service';

@Module({
  imports: [DatabaseModule],
  providers: [PostsResolver, PostsService, PrismaService],
})
export class PostsModule {}
