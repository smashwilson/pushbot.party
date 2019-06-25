import {QueryResult} from "../common/Transport";

import {
  RecentChannelQuery,
  RecentChannelQueryVariables,
  RecentChannelQueryResponse,
} from "../__generated__/RecentChannelQuery.graphql";

import {
  RecentHistoryQuery,
  RecentHistoryQueryVariables,
  RecentHistoryQueryResponse,
} from "../__generated__/RecentHistoryQuery.graphql";

export type RecentChannelQuery = RecentChannelQuery;
export type RecentChannelQueryVariables = RecentChannelQueryVariables;
export type RecentChannelQueryResponse = RecentChannelQueryResponse;
export type RecentChannelResult = QueryResult<RecentChannelQuery>;

export type RecentHistoryQuery = RecentHistoryQuery;
export type RecentHistoryQueryVariables = RecentHistoryQueryVariables;
export type RecentHistoryQueryResponse = RecentHistoryQueryResponse;
export type RecentHistoryResult = QueryResult<RecentHistoryQuery>;

export type ILine = NonNullable<
  RecentHistoryQueryResponse["cache"]["linesForChannel"]
>[0];

export const ALL = Symbol("all");

export type IChange = ILine | typeof ALL;

export interface IDisposable {
  dispose(): void;
}
