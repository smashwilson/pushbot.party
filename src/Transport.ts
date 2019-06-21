import {
  Environment,
  Network,
  RecordSource,
  Store,
  OperationType,
  RequestParameters,
  Variables,
} from "relay-runtime";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/graphql`;
export const AUTH_URL = `${process.env.REACT_APP_API_BASE_URL}/auth/${process.env.REACT_APP_API_AUTH_TYPE}`;

export interface QueryResult<T extends OperationType> {
  error: Error | null;
  props: T["response"] | null;
  retry: (() => void) | null;
}

const NETWORK_ERROR_MARKER = Symbol("is-network-error");

export interface NetworkError extends Error {
  status: number;
  text: string;
  marker: typeof NETWORK_ERROR_MARKER;
}

export function isNetworkError(err: Error | null): err is NetworkError {
  return err ? (err as NetworkError).marker === NETWORK_ERROR_MARKER : false;
}

async function createNetworkError(message: string, response: Response) {
  const err = new Error(message) as NetworkError;
  err.status = response.status;
  err.text = await response.text();
  err.marker = NETWORK_ERROR_MARKER;
  return err as NetworkError;
}

async function fetchQuery(
  request: RequestParameters,
  variables: Variables
): Promise<any> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      query: request.text,
      variables,
    }),
  });

  if (response.ok) {
    return response.json();
  } else {
    throw await createNetworkError(
      `API server responded with ${response.status}`,
      response
    );
  }
}

const source = new RecordSource();
const network = Network.create(fetchQuery);

export function getEnvironment(): Environment {
  const store = new Store(source);

  return new Environment({
    network,
    store,
  });
}
