import React from "react";

interface Props {
  path: string;
}

export function ServicePath(props: Props) {
  const lastSlashIndex = props.path.lastIndexOf('/');
  const dirname = props.path.slice(0, lastSlashIndex);
  const basename = props.path.slice(lastSlashIndex + 1);

  return (
    <span className="text-monospace">
      <span className="text-muted">
        {dirname}
        /
      </span>
      <span className="font-weight-bold">{basename}</span>
    </span>
  );
}
