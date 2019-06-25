import {AppQuery, AppQueryResponse} from "../__generated__/AppQuery.graphql";
import {QueryResult} from "./Transport";

export type AppQuery = AppQuery;
export type AppQueryResponse = AppQueryResponse;
export type AppQueryResult = QueryResult<AppQuery>;

export type IUser = AppQueryResponse["users"]["me"];
