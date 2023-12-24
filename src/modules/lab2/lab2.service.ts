import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class Lab2Service {
  constructor(private readonly prismaService: PrismaService) {}
  executeRawQuery(query: string) {
    try {
      const result = this.prismaService.$queryRawUnsafe(query);

      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}
