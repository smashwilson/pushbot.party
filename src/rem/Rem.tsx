import React from "react";

import {useQueryParameter} from "../common/urlSearch";
import {RemForm} from "./RemForm";
import {RandomMemoryList} from "./RandomMemoryList";
import {MatchingMemoryList} from "./MatchingMemoryList";

export function Rem() {
  const [query, setQuery] = useQueryParameter("q");

  return (
    <>
      <h3>rem</h3>
      <RemForm query={query} onChange={setQuery} />
      {query === "" ? (
        <RandomMemoryList />
      ) : (
        <MatchingMemoryList query={query} />
      )}
    </>
  );
}
