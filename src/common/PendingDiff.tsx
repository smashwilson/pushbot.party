import React, {useState, useEffect} from "react";

import {Coordinator, IDelta} from "./coordinator";

const nullDelta: IDelta = {
  units_to_add: [],
  units_to_change: [],
  units_to_restart: [],
  units_to_remove: [],
  files_to_write: [],
};

export function hasPendingDelta(delta: IDelta) {
  return [
    delta.units_to_add,
    delta.units_to_change,
    delta.units_to_remove,
    delta.units_to_restart,
    delta.units_to_remove,
    delta.files_to_write,
  ].some(arr => arr.length > 0);
}

export const PendingDiffContext = React.createContext<IDelta>(nullDelta);

interface PendingDiffProps {
  coordinator: Coordinator;
  children: JSX.Element;
}

export function PendingDiff(props: PendingDiffProps) {
  const [delta, setDelta] = useState<IDelta>(nullDelta);

  useEffect(() => {
    let ignore = false;

    async function fetchDelta() {
      const delta = await props.coordinator.getDiff().catch(() => nullDelta);
      if (!ignore) {
        setDelta(delta);
      }
    }

    fetchDelta();
    return () => {
      ignore = true;
    };
  });

  return (
    <PendingDiffContext.Provider value={delta}>
      {props.children}
    </PendingDiffContext.Provider>
  );
}
