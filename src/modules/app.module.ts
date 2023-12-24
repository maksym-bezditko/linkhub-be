import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PostsModule } from './posts/posts.module';
import { GraphQLFormattedError } from 'graphql';
import { FilesModule } from './files/files.module';
import { FriendsModule } from './friends/friends.module';
import { StatsModule } from './stats/stats.module';
import { Lab2Module } from './lab2/lab2.module';

@Module({
  imports: [
    AuthModule,

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

    PostsModule,

    AuthModule,

    FilesModule,

    FriendsModule,

    StatsModule,

    Lab2Module,
  ],
})
export class AppModule {}
