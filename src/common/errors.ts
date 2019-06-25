const NETWORK_ERROR_MARKER = Symbol("is-network-error");

export interface NetworkError extends Error {
  status: number;
  text: string;
  marker: typeof NETWORK_ERROR_MARKER;
}

export function isNetworkError(err: Error | null): err is NetworkError {
  return err ? (err as NetworkError).marker === NETWORK_ERROR_MARKER : false;
}

export async function createNetworkError(message: string, response: Response) {
  const err = new Error(message) as NetworkError;
  err.status = response.status;
  err.text = await response.text();
  err.marker = NETWORK_ERROR_MARKER;
  return err as NetworkError;
}
