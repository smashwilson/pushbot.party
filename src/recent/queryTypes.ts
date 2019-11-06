import {QueryResult} from "../common/Transport";

import {
  RecentChannelQuery as ORecentChannelQuery,
  RecentChannelQueryVariables as ORecentChannelQueryVariables,
  RecentChannelQueryResponse as ORecentChannelQueryResponse,
} from "../__generated__/RecentChannelQuery.graphql";

import {
  RecentHistoryQuery as ORecentHistoryQuery,
  RecentHistoryQueryVariables as ORecentHistoryQueryVariables,
  RecentHistoryQueryResponse as ORecentHistoryQueryResponse,
} from "../__generated__/RecentHistoryQuery.graphql";

export type RecentChannelQuery = ORecentChannelQuery;
export type RecentChannelQueryVariables = ORecentChannelQueryVariables;
export type RecentChannelQueryResponse = ORecentChannelQueryResponse;
export type RecentChannelResult = QueryResult<RecentChannelQuery>;

export type RecentHistoryQuery = ORecentHistoryQuery;
export type RecentHistoryQueryVariables = ORecentHistoryQueryVariables;
export type RecentHistoryQueryResponse = ORecentHistoryQueryResponse;
export type RecentHistoryResult = QueryResult<RecentHistoryQuery>;

export type ILine = NonNullable<
  RecentHistoryQueryResponse["cache"]["linesForChannel"]
>[0];

export const ALL = Symbol("all");

export type IChange = ILine | typeof ALL;

export interface IDisposable {
  dispose(): void;
}
