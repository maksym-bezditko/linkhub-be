import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PostsModule } from './posts/posts.module';
import { GraphQLFormattedError } from 'graphql';

@Module({
  imports: [
    AuthModule,

    UserProfileModule,

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
  ],
})
export class AppModule {}
