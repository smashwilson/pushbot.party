import {QueryResult} from "../common/Transport";

import {RecentChannelQuery as ORecentChannelQuery} from "../__generated__/RecentChannelQuery.graphql";

import {RecentHistoryQuery as ORecentHistoryQuery} from "../__generated__/RecentHistoryQuery.graphql";

export type RecentChannelQuery = ORecentChannelQuery;
export type RecentChannelQueryVariables = ORecentChannelQuery["variables"];
export type RecentChannelQueryResponse = ORecentChannelQuery["response"];
export type RecentChannelResult = QueryResult<RecentChannelQuery>;

export type RecentHistoryQuery = ORecentHistoryQuery;
export type RecentHistoryQueryVariables = ORecentHistoryQuery["variables"];
export type RecentHistoryQueryResponse = ORecentHistoryQuery["response"];
export type RecentHistoryResult = QueryResult<RecentHistoryQuery>;

export type ILine = NonNullable<
  RecentHistoryQueryResponse["cache"]["linesForChannel"]
>[0];

export const ALL = Symbol("all");

export type IChange = ILine | typeof ALL;

export interface IDisposable {
  dispose(): void;
}
