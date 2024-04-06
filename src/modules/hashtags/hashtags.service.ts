import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class HashtagsService {
  private readonly logger = new Logger(HashtagsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async getPostHashtags(postId: number) {
    const hashtags = await this.prismaService.postsOnHashtags.findMany({
      where: {
        postId,
      },
      select: {
        hashtag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    this.logger.log('Retrieved hashtags for post with id: ' + postId);

    return hashtags.map((item) => item.hashtag);
  }
}
