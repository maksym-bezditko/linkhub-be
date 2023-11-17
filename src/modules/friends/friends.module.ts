import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsResolver } from './friends.resolver';
import { DatabaseModule } from 'src/modules/database/database.module';
import { PrismaService } from 'src/modules/database/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [DatabaseModule, ConfigModule.forRoot()],
  providers: [FriendsResolver, FriendsService, PrismaService],
})
export class FriendsModule {}
