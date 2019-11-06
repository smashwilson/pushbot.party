import {
  QuotePageQuery as OQuotePageQuery,
  QuotePageQueryVariables as OQuotePageQueryVariables,
  QuotePageQueryResponse as OQuotePageQueryResponse,
} from "../__generated__/QuotePageQuery.graphql";

import {
  RandomQuoteQuery as ORandomQuoteQuery,
  RandomQuoteQueryVariables as ORandomQuoteQueryVariables,
  RandomQuoteQueryResponse as ORandomQuoteQueryResponse,
} from "../__generated__/RandomQuoteQuery.graphql";

import {QueryResult} from "../common/Transport";

export type QuotePageQuery = OQuotePageQuery;
export type QuotePageQueryResponse = OQuotePageQueryResponse;
export type QuotePageQueryVariables = OQuotePageQueryVariables;
export type QuotePageResult = QueryResult<QuotePageQuery>;

export type IQuotes = NonNullable<
  QuotePageQueryResponse["documents"]
>["all"]["edges"];

export type RandomQuoteQuery = ORandomQuoteQuery;
export type RandomQuoteQueryVariables = ORandomQuoteQueryVariables;
export type RandomQuoteQueryResponse = ORandomQuoteQueryResponse;
export type RandomQuoteResult = QueryResult<RandomQuoteQuery>;
