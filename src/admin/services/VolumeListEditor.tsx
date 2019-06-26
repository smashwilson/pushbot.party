import React, {useState, useRef, useEffect} from "react";

import {IVolumeMap} from "../../common/coordinator";

interface VolumeListProps {
  volumeMap: IVolumeMap;
  onDelete: (hostPath: string) => any;
  onCreate: (hostPath: string, containerPath: string) => any;
}

export function VolumeListEditor(props: VolumeListProps) {
  const [expanded, setExpanded] = useState(false);
  const [hostPath, setHostPath] = useState("/etc/ssl/az/");
  const [containerPath, setContainerPath] = useState("");

  const canCreate = hostPath.length > 0 && containerPath.length > 0;

  const hostPaths = Object.keys(props.volumeMap);
  const existingVolumes = hostPaths.map((hostPath, i) => (
    <div className="form-row" key={i}>
      <div className="col-sm-5">
        host: <span className="text-monospace">{hostPath}</span>
      </div>
      <div className="col-sm-5">
        container:{" "}
        <span className="text-monospace">{props.volumeMap[hostPath]}</span>
      </div>
      <div className="col-sm-2 d-flex justify-content-end">
        <button
          className="btn btn-outline-danger"
          onClick={evt => {
            evt.preventDefault();
            props.onDelete(hostPath);
          }}
        >
          <i className="far fa-trash-alt text-danger" />
        </button>
      </div>
    </div>
  ));

  const newVolume = expanded ? (
    <div className="form-row">
      <div className="col-sm-5 input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">host</span>
        </div>
        <input
          type="text"
          value={hostPath}
          onChange={evt => setHostPath(evt.target.value)}
          className="form-control text-monospace"
        />
      </div>
      <div className="col-sm-5 input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">container</span>
        </div>
        <input
          type="text"
          value={containerPath}
          onChange={evt => setContainerPath(evt.target.value)}
          className="form-control text-monospace"
        />
      </div>
      <div className="col-sm-2 d-flex justify-content-end">
        <div className="btn-group">
          <button
            className="btn btn-outline-success"
            disabled={!canCreate}
            onClick={evt => {
              evt.preventDefault();
              props.onCreate(hostPath, containerPath);
              setHostPath("/etc/ssl/az/");
              setContainerPath("");
              setExpanded(false);
            }}
          >
            <i className="fas fa-plus" />
          </button>
          <button
            className="btn btn-outline-info"
            onClick={evt => {
              evt.preventDefault();
              setExpanded(false);
            }}
          >
            <i className="far fa-minus-square" />
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="form-row">
      <div className="col-sm-2">
        <button
          className="btn btn-outline-info"
          onClick={evt => {
            evt.preventDefault();
            setExpanded(true);
          }}
        >
          <i className="far fa-plus-square" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {existingVolumes}
      {newVolume}
    </>
  );
}
