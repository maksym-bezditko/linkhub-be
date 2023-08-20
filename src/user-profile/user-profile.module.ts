import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileResolver } from './graphql/user-profile.resolver';
import { DatabaseModule } from 'src/database/database.module';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [DatabaseModule],
  providers: [UserProfileResolver, UserProfileService, PrismaService],
})
export class UserProfileModule {}
