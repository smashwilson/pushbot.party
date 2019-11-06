import {
  AppQuery as OAppQuery,
  AppQueryResponse as OAppQueryResponse,
} from "../__generated__/AppQuery.graphql";
import {QueryResult} from "./Transport";

export type AppQuery = OAppQuery;
export type AppQueryResponse = OAppQueryResponse;
export type AppQueryResult = QueryResult<AppQuery>;

export type IUser = AppQueryResponse["users"]["me"];
