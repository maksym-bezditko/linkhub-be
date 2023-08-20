import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UserProfileService {
  constructor(private readonly prismaService: PrismaService) {}
  findAll() {
    return this.prismaService.user.findMany();
  }

  findOne(id: string) {
    return this.prismaService.user.findFirst({
      where: {
        id,
      },
      include: {
        userInfo: true,
      },
    });
  }
}
