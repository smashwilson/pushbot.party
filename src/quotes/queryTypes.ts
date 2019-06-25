import {
  QuotesPageQuery,
  QuotesPageQueryVariables,
  QuotesPageQueryResponse,
} from "../__generated__/QuotesPageQuery.graphql";

import {
  QuotesRandomQuery,
  QuotesRandomQueryVariables,
  QuotesRandomQueryResponse,
} from "../__generated__/QuotesRandomQuery.graphql";

import {QueryResult} from "../common/Transport";

export type QuotesPageQuery = QuotesPageQuery;
export type QuotesPageQueryResponse = QuotesPageQueryResponse;
export type QuotesPageQueryVariables = QuotesPageQueryVariables;
export type QuotesPageResult = QueryResult<QuotesPageQuery>;

export type IQuotes = NonNullable<
  QuotesPageQueryResponse["documents"]
>["all"]["edges"];

export type QuotesRandomQuery = QuotesRandomQuery;
export type QuotesRandomQueryVariables = QuotesRandomQueryVariables;
export type QuotesRandomQueryResponse = QuotesRandomQueryResponse;
export type QuotesRandomResult = QueryResult<QuotesRandomQuery>;
