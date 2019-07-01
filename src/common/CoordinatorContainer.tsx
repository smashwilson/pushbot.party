import {useContext, useEffect, useState} from "react";

import {Coordinator, CoordinatorContext} from "./coordinator";

interface CoordinatorContainerProps<R> {
  getter: (c: Coordinator) => Promise<R>;
  nullValue: R;
  children: (value: R, isLoading: boolean, refresh: () => void) => JSX.Element;
}

export function CoordinatorContainer<R>(props: CoordinatorContainerProps<R>) {
  const coordinator = useContext(CoordinatorContext);
  const {getter} = props;
  const [value, setValue] = useState<R>(props.nullValue);
  const [isLoading, setLoading] = useState(true);
  const [latch, setLatch] = useState(false);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    getter(coordinator).then(v => {
      if (!ignore) {
        setValue(v);
      }
      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [coordinator, getter, latch]);

  function refresh() {
    setLatch(!latch);
  }

  return props.children(value, isLoading, refresh);
}
