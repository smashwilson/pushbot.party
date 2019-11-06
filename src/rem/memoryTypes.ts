import {
  RandomMemoryListQuery as ORandomMemoryListQuery,
  RandomMemoryListQueryVariables as ORandomMemoryListQueryVariables,
  RandomMemoryListQueryResponse as ORandomMemoryListQueryResponse,
} from "../__generated__/RandomMemoryListQuery.graphql";

import {QueryResult} from "../common/Transport";

export type RandomMemoryListQuery = ORandomMemoryListQuery;
export type RandomMemoryListQueryVariables = ORandomMemoryListQueryVariables;
export type RandomMemoryListQueryResponse = ORandomMemoryListQueryResponse;

export type RandomMemoryListResult = QueryResult<RandomMemoryListQuery>;

import {MatchingMemoryPage_rem} from "../__generated__/MatchingMemoryPage_rem.graphql";

export type MatchingMemoryPageRem = MatchingMemoryPage_rem;
