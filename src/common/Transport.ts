import {
  Environment,
  Network,
  RecordSource,
  Store,
  OperationType,
  RequestParameters,
  Variables,
} from "relay-runtime";

import {createNetworkError, createGraphQLError} from "./errors";

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
    const payload = await response.json();
    if (payload.errors) {
      throw createGraphQLError(
        `API server responded with GraphQL errors`,
        API_URL,
        payload.errors
      );
    }
    return payload;
  } else {
    throw await createNetworkError(
      `API server responded with ${response.status}`,
      API_URL,
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
