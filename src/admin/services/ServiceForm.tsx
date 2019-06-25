import React, {useState} from "react";
import {Link} from "react-router-dom";

import {IDesiredUnit} from "../../common/coordinator";

interface ServiceFormProps {
  mode: "create" | "update";
  original: IDesiredUnit;
}

export function ServiceForm({mode, original}: ServiceFormProps) {
  const [currentPath, setCurrentPath] = useState(original.path);

  return (
    <form className="border rounded p-3">
      <div className="form-row">
        <label htmlFor="serviceEditor--path" className="col-sm-2">
          Path:
        </label>
        <div className="col-sm-10">
          <input
            id="serviceEditor--path"
            className="form-control"
            type="text"
            value={currentPath}
            onChange={evt => setCurrentPath(evt.target.value)}
            readOnly={mode === "update"}
          />
        </div>
      </div>
      <div className="form-row d-flex align-items-baseline justify-content-end m-3">
        <Link to="/admin/services" className="btn btn-secondary">
          Cancel
        </Link>
        <button type="submit" className="btn btn-primary">
          {mode === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
}
