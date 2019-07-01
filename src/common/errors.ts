const NETWORK_ERROR_MARKER = Symbol("is-network-error");
const GRAPHQL_ERROR_MARKER = Symbol("is-graphql-error");

export interface NetworkError extends Error {
  requestURL: string;
  responseStatus: number;
  responseText: string;
  marker: typeof NETWORK_ERROR_MARKER;
}

export interface GraphQLError extends Error {
  requestURL: string;
  errors: string[];
  marker: typeof GRAPHQL_ERROR_MARKER;
}

export function isNetworkError(err: Error | null): err is NetworkError {
  return err ? (err as NetworkError).marker === NETWORK_ERROR_MARKER : false;
}

export function isGraphQLError(err: Error | null): err is GraphQLError {
  return err ? (err as GraphQLError).marker === GRAPHQL_ERROR_MARKER : false;
}

export async function createNetworkError(
  message: string,
  url: string,
  response: Response
) {
  const err = new Error(message) as NetworkError;
  err.requestURL = url;
  err.responseStatus = response.status;
  err.responseText = await response.text();
  err.marker = NETWORK_ERROR_MARKER;
  return err as NetworkError;
}

export function createGraphQLError(
  message: string,
  url: string,
  errors: string[]
) {
  const err = new Error(message) as GraphQLError;
  err.requestURL = url;
  err.errors = [...errors];
  return err;
}
