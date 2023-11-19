import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsResolver } from './stats.resolver';
import { PrismaService } from '../database/prisma.service';

@Module({
  providers: [StatsResolver, StatsService, PrismaService],
})
export class StatsModule {}
