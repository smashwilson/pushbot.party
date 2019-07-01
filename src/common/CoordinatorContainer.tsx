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
  const [isLoading, setLoading] = useState(true);
  const [value, setValue] = useState(props.nullValue);
  const [latch, setLatch] = useState(0);

  useEffect(() => {
    let ignore = false;

    (async function() {
      setLoading(true);
      const v = await getter(coordinator);

      if (!ignore) {
        setLoading(false);
        setValue(v);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [coordinator, getter, latch]);

  function refresh() {
    setLatch(current => current + 1);
  }

  return props.children(value, isLoading, refresh);
}
