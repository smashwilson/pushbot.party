import {useState} from "react";

export function useQueryParameter(
  parameterName: string
): [string, (v: string) => void] {
  const [, setLatch] = useState(0);

  const params = new URLSearchParams(window.location.search);
  const current = params.get(parameterName) || "";

  function setNext(next: string) {
    const nextParams = new URLSearchParams();
    if (next.length > 0) {
      nextParams.set(parameterName, next);
    }

    const nextSearch = nextParams.toString();
    const nextURL =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      (nextSearch.length > 0 ? "?" + nextSearch : "") +
      window.location.hash;

    if (window.history.replaceState) {
      window.history.replaceState({}, "", nextURL);
    } else {
      window.location.href = nextURL;
    }
    setLatch((latch) => latch + 1);
  }

  return [current, setNext];
}
