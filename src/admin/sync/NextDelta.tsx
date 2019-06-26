import React, {useContext} from "react";
import {Link} from "react-router-dom";
import cx from "classnames";

import {IDesiredUnit} from "../../common/coordinator";
import {PendingDiffContext, hasPendingDelta} from "../../common/PendingDiff";

export function NextDelta() {
  const delta = useContext(PendingDiffContext);

  if (!hasPendingDelta(delta)) {
    return (
      <div className="card border-success">
        <div className="card-body">
          <p className="card-text text-success">
            <i className="fas fa-check-circle mr-3" />
            No changes waiting to be applied.
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
  for (const unit of delta.units_to_add) {
    changeRows.push(
      createDesiredRow(
        unit,
        "creating unit",
        "text-success",
        "far fa-plus-square"
      )
    );
  }
  for (const unit of delta.units_to_change) {
    changeRows.push(
      createDesiredRow(unit, "modifying unit", "text-info", "fas fa-tools")
    );
  }
  for (const unit of delta.units_to_restart) {
    changeRows.push(
      createDesiredRow(unit, "restarting unit", "text-info", "fas fa-recycle")
    );
  }
  for (const unit of delta.units_to_remove) {
    changeRows.push(
      <p className="card-text text-danger">
        <i className="mr-3 fas fa-fire" />
        removing unit <span className="font-weight-bold">{unit.path}</span>
      </p>
    );
  }
  for (const filePath of delta.files_to_write) {
    changeRows.push(
      <p className="card-text text-info">
        <i className="mr-3 far fa-file-alt" />
        writing file <span className="font-weight-bold">{filePath}</span>
      </p>
    );
  }

  return (
    <div className="card bg-light">
      <h5 className="card-header">Changes to apply</h5>
      <div className="card-body">{changeRows}</div>
      <div className="card-footer">
        <button className="btn btn-primary">Sync</button>
      </div>
    </div>
  );
}
