import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ProfileResponse } from 'src/graphql/responses/profile.response';

@Injectable()
export class ProfileService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUsersProfileByTheirId(
    userId: string | undefined,
  ): Promise<ProfileResponse | null> {
    if (!userId) throw new UnauthorizedException();

    try {
      return this.prismaService.profile.findUniqueOrThrow({
        where: {
          userId,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
