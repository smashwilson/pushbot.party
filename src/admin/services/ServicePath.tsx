import React from "react";
import * as path from "path";

interface Props {
  path: string;
}

export function ServicePath(props: Props) {
  const dirname = path.dirname(props.path);
  const basename = path.basename(props.path);

  return (
    <span className="text-monospace">
      <span className="text-muted">
        {dirname}
        {path.sep}
      </span>
      <span className="font-weight-bold">{basename}</span>
    </span>
  );
}
