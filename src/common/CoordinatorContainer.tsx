import {useContext, useEffect, useState} from "react";

import {Coordinator, CoordinatorContext} from "./coordinator";

interface CoordinatorContainerProps<R> {
  getter: (c: Coordinator) => Promise<R>;
  nullValue: R;
  children: (value: R, isLoading: boolean) => JSX.Element;
}

export function CoordinatorContainer<R>(props: CoordinatorContainerProps<R>) {
  const coordinator = useContext(CoordinatorContext);
  const {getter} = props;
  const [value, setValue] = useState<R>(props.nullValue);
  const [isLoading, setLoading] = useState(true);

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
  }, [coordinator, getter]);

  return props.children(value, isLoading);
}
