import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { GraphQLFormattedError } from 'graphql';
import { ConfigModule } from '@nestjs/config';
import { FollowsModule } from './follows/follows.module';
import { FilesModule } from './files/files.module';
import { PostsModule } from './posts/posts.module';
import { HashtagsModule } from './hashtags/hashtags.module';
import { LikesModule } from './likes/likes.module';

@Module({
  imports: [
    AuthModule,

    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      sortSchema: true,
      includeStacktraceInErrorResponses: false,
      formatError(formattedError): GraphQLFormattedError {
        return {
          message: formattedError.message,
          extensions: formattedError.extensions,
        };
      },
    }),

    FollowsModule,

    PostsModule,

    FilesModule,

    HashtagsModule,

    LikesModule,
  ],
  providers: [],
})
export class AppModule {}
