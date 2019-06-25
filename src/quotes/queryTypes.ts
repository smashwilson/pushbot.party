import {
  QuotePageQuery,
  QuotePageQueryVariables,
  QuotePageQueryResponse,
} from "../__generated__/QuotePageQuery.graphql";

import {
  RandomQuoteQuery,
  RandomQuoteQueryVariables,
  RandomQuoteQueryResponse,
} from "../__generated__/RandomQuoteQuery.graphql";

import {QueryResult} from "../common/Transport";

export type QuotePageQuery = QuotePageQuery;
export type QuotePageQueryResponse = QuotePageQueryResponse;
export type QuotePageQueryVariables = QuotePageQueryVariables;
export type QuotePageResult = QueryResult<QuotePageQuery>;

export type IQuotes = NonNullable<
  QuotePageQueryResponse["documents"]
>["all"]["edges"];

export type RandomQuoteQuery = RandomQuoteQuery;
export type RandomQuoteQueryVariables = RandomQuoteQueryVariables;
export type RandomQuoteQueryResponse = RandomQuoteQueryResponse;
export type RandomQuoteResult = QueryResult<RandomQuoteQuery>;
