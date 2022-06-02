import {AppQuery as OAppQuery} from "../__generated__/AppQuery.graphql";
import {QueryResult} from "./Transport";

export type AppQuery = OAppQuery;
export type AppQueryResponse = OAppQuery["response"];
export type AppQueryResult = QueryResult<AppQuery>;

export type IUser = AppQueryResponse["users"]["me"];
