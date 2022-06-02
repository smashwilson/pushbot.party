import {RandomMemoryListQuery as ORandomMemoryListQuery} from "../__generated__/RandomMemoryListQuery.graphql";

import {QueryResult} from "../common/Transport";

export type RandomMemoryListQuery = ORandomMemoryListQuery;
export type RandomMemoryListQueryVariables =
  ORandomMemoryListQuery["variables"];
export type RandomMemoryListQueryResponse = ORandomMemoryListQuery["response"];

export type RandomMemoryListResult = QueryResult<RandomMemoryListQuery>;

import {MatchingMemoryPage_rem$data} from "../__generated__/MatchingMemoryPage_rem.graphql";
export type MatchingMemoryPageRem = MatchingMemoryPage_rem$data;
