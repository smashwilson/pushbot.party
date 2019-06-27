import React from "react";
import {Link} from "react-router-dom";
import cx from "classnames";

import {IDelta, IDesiredUnit} from "../../common/coordinator";
import {hasPendingDelta} from "../../common/PendingDiff";

interface Tense {
  create: string;
  modify: string;
  restart: string;
  remove: string;
  write: string;
}

export const futureTense: Tense = {
  create: "will create",
  modify: "will modify",
  restart: "will restart",
  remove: "will remove",
  write: "will write",
};

export const pastTense: Tense = {
  create: "created",
  modify: "modified",
  restart: "restarted",
  remove: "removed",
  write: "wrote",
};

interface DeltaViewProps {
  delta: IDelta;
  headerText: string;
  emptyText: string;
  tense: Tense;
}

export function DeltaView(props: DeltaViewProps) {
  if (!hasPendingDelta(props.delta)) {
    return (
      <div className="card border-success my-3 mx-0">
        <div className="card-body">
          <p className="card-text text-success">
            <i className="fas fa-check-circle mr-3" />
            {props.emptyText}
          </p>
        </div>
      </div>
    );
  }

  function createDesiredRow(
    unit: IDesiredUnit,
    action: string,
    textClass: string,
    iconClass: string
  ): React.ReactNode {
    return (
      <p className={cx("card-text", textClass)}>
        <i className={cx("mr-3", iconClass)} />
        {action}{" "}
        <Link
          to={`/admin/services/${encodeURIComponent(unit.id.toString())}`}
          className={cx("font-weight-bold", textClass)}
        >
          {unit.path}
        </Link>
      </p>
    );
  }

  const changeRows: React.ReactNodeArray = [];
  for (const unit of props.delta.units_to_add) {
    changeRows.push(
      createDesiredRow(
        unit,
        `${props.tense.create} unit`,
        "text-success",
        "far fa-plus-square"
      )
    );
  }
  for (const unit of props.delta.units_to_change) {
    changeRows.push(
      createDesiredRow(
        unit,
        `${props.tense.modify} unit`,
        "text-info",
        "fas fa-tools"
      )
    );
  }
  for (const unit of props.delta.units_to_restart) {
    changeRows.push(
      createDesiredRow(
        unit,
        `${props.tense.restart} unit`,
        "text-info",
        "fas fa-recycle"
      )
    );
  }
  for (const unit of props.delta.units_to_remove) {
    changeRows.push(
      <p className="card-text text-danger">
        <i className="mr-3 fas fa-fire" />
        {props.tense.remove} unit{" "}
        <span className="font-weight-bold">{unit.path}</span>
      </p>
    );
  }
  for (const filePath of props.delta.files_to_write) {
    changeRows.push(
      <p className="card-text text-info">
        <i className="mr-3 far fa-file-alt" />
        {props.tense.write} file{" "}
        <span className="font-weight-bold">{filePath}</span>
      </p>
    );
  }

  return (
    <div className="card bg-light my-3 mx-0">
      <h5 className="card-header">{props.headerText}</h5>
      <div className="card-body">{changeRows}</div>
    </div>
  );
}
