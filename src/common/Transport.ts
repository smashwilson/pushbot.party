import {
  Environment,
  Network,
  RecordSource,
  Store,
  OperationType,
  RequestParameters,
  Variables,
} from "relay-runtime";

import {createNetworkError} from "./errors";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/graphql`;
export const AUTH_URL = `${process.env.REACT_APP_API_BASE_URL}/auth/${process.env.REACT_APP_API_AUTH_TYPE}`;

export interface QueryResult<T extends OperationType> {
  error: Error | null;
  props: T["response"] | null;
  retry: (() => void) | null;
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
