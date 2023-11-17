import { InputType, Field } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { SearchBy, SexFilter, SortBy } from 'src/models';

@InputType()
export class SearchUsersInput {
  @Field()
  @IsEnum(SearchBy)
  searchBy: SearchBy;

  @Field()
  @IsEnum(SortBy)
  sortBy: SortBy;

  @Field()
  searchText: string;

  @Field()
  @IsEnum(SexFilter)
  sex: SexFilter;

  @Field()
  withPostsOnly: boolean;
}
