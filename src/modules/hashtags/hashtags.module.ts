import { Module } from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [HashtagsService],
  exports: [HashtagsService],
})
export class HashtagsModule {}
