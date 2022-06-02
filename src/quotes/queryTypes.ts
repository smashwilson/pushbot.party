import {QuotePageQuery as OQuotePageQuery} from "../__generated__/QuotePageQuery.graphql";

import {RandomQuoteQuery as ORandomQuoteQuery} from "../__generated__/RandomQuoteQuery.graphql";

import {QueryResult} from "../common/Transport";

export type QuotePageQuery = OQuotePageQuery;
export type QuotePageQueryResponse = OQuotePageQuery["response"];
export type QuotePageQueryVariables = OQuotePageQuery["variables"];
export type QuotePageResult = QueryResult<QuotePageQuery>;

export type IQuotes = NonNullable<
  QuotePageQueryResponse["documents"]
>["all"]["edges"];

export type RandomQuoteQuery = ORandomQuoteQuery;
export type RandomQuoteQueryVariables = ORandomQuoteQuery["variables"];
export type RandomQuoteQueryResponse = ORandomQuoteQuery["response"];
export type RandomQuoteResult = QueryResult<RandomQuoteQuery>;
