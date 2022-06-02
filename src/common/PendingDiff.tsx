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
  ].some((arr) => arr.length > 0);
}

export interface PendingDiff {
  delta: IDelta;
  refresh: () => void;
}

export const PendingDiffContext = React.createContext<PendingDiff>({
  delta: nullDelta,
  refresh: () => {},
});

interface PendingDiffProps {
  coordinator: Coordinator;
  children: JSX.Element;
}

export function PendingDiffProvider(props: PendingDiffProps) {
  const [delta, setDelta] = useState<IDelta>(nullDelta);
  const [latch, setLatch] = useState(0);

  useEffect(() => {
    let ignore = false;

    (async function () {
      const delta = await props.coordinator.getDiff().catch(() => nullDelta);
      if (!ignore) {
        setDelta(delta);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [props.coordinator, latch]);

  const pendingDiff = {
    delta,
    refresh: () => setLatch((current) => current + 1),
  };

  return (
    <PendingDiffContext.Provider value={pendingDiff}>
      {props.children}
    </PendingDiffContext.Provider>
  );
}
