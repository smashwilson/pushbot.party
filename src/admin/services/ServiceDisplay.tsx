import React from "react";
import {Link} from "react-router-dom";

import {IDesiredUnit, IPortMap} from "../../common/coordinator";
import {ServicePath} from "./ServicePath";

interface ServiceDisplayProps {
  unit: IDesiredUnit;
}

function plural(count: number, noun: string) {
  if (count === 1) {
    return `${count} ${noun}`;
  } else {
    return `${count} ${noun}s`;
  }
}

function ports(p: IPortMap) {
  const keys = Object.keys(p);
  if (keys.length === 0) {
    return null;
  }

  const mappings: string[] = [];
  for (const source of Object.keys(p)) {
    const dest = p[source];
    mappings.push(`${source} => ${dest}`);
  }
  return mappings.join(", ");
}

export function ServiceDisplay(props: ServiceDisplayProps) {
  const {unit} = props;

  return (
    <li className="list-group-item px-4 rounded pushbot-serviceDisplay">
      <div className="float-right pushbot-serviceDisplay--controls">
        <Link
          to={`/admin/services/${unit.id}`}
          className="btn btn-secondary d-flex align-items-baseline"
        >
          <i className="fas fa-cog me-2" />
          edit
        </Link>
      </div>
      <ServicePath path={unit.path} />
      <p>
        type <span className="font-weight-bold">{unit.type}</span>
        {" | "}
        {plural(Object.keys(unit.env).length, " environment variable")}
        {" | "}
        {plural(unit.secrets.length, " secret")}
        {" | "}
        {plural(Object.keys(unit.volumes).length, "volume")} {ports(unit.ports)}
      </p>
    </li>
  );
}
