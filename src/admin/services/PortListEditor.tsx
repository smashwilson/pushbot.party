import React, {useState, useRef, useEffect} from "react";

import {IPortMap} from "../../common/coordinator";

interface PortListProps {
  portMap: IPortMap;
  onCreate: (hostPort: string, containerPort: number) => any;
  onDelete: (hostPort: string) => any;
}

export function PortListEditor(props: PortListProps) {
  const [expanded, setExpanded] = useState(false);
  const [hostPort, setHostPort] = useState("");
  const [containerPort, setContainerPort] = useState("");

  const hostPortRef = useRef<HTMLInputElement>(null);

  const canCreate = hostPort.length > 0 && containerPort.length > 0;

  useEffect(() => {
    if (expanded && hostPortRef.current) {
      hostPortRef.current.focus();
    }
  }, [expanded]);

  const hostPorts = Object.keys(props.portMap);
  const existingPorts =
    hostPorts.length > 0 ? (
      <div className="form-row mb-2">
        <ul className="list-group list-group-horizontal">
          {hostPorts.map((hostPort, i) => (
            <li key={`hostPort-${i}`} className="list-group-item">
              {hostPort} <i className="fas fa-arrow-right mx-2" />{" "}
              {props.portMap[hostPort]}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  const newPort = expanded ? (
    <div className="form-row">
      <div className="col-sm-5 input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">host</span>
        </div>
        <input
          ref={hostPortRef}
          type="number"
          value={hostPort}
          onChange={evt => setHostPort(evt.target.value)}
          className="form-control"
        />
      </div>
      <div className="col-sm-5 input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">container</span>
        </div>
        <input
          type="number"
          value={containerPort}
          onChange={evt => setContainerPort(evt.target.value)}
          className="form-control"
        />
      </div>
      <div className="col-sm-2 d-flex justify-content-end">
        <div className="btn-group">
          <button
            className="btn btn-outline-success"
            disabled={!canCreate}
            onClick={evt => {
              evt.preventDefault();
              props.onCreate(hostPort, parseInt(containerPort, 10));
              setHostPort("");
              setContainerPort("");
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
      {existingPorts}
      {newPort}
    </>
  );
}
