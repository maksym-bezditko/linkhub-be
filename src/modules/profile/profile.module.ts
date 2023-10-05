import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResolver } from './profile.resolver';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [DatabaseModule],
  providers: [ProfileResolver, ProfileService, PrismaService],
})
export class ProfileModule {}
