import {Environment, Network, RecordSource, Store} from "relay-runtime";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/graphql`;
export const AUTH_URL = `${process.env.REACT_APP_API_BASE_URL}/auth/${API_AUTH_TYPE}`;

export interface Operation {
  text: string;
}

export interface Variables {
  [variableName: string]: any;
}

async function fetchQuery(
  operation: Operation,
  variables: Variables
): Promise<any> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  });

  if (response.ok) {
    return response.json();
  } else {
    const err = new Error(`API server responded with ${response.status}`);
    err.status = response.status;
    err.text = await response.text();
    throw err;
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
